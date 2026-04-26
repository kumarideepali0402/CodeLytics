import prisma from "../db/prisma.js";
import crypto from "crypto"
import { cfCheck } from "../utils/checkers/cfChecker.js";


export const getHandles = async(req, res) => {
    const studentId = req.user?.id;
    if(!studentId) return res.status(401).json({
        msg : "Unauthorized"
    })

    try {
        const platforms = await prisma.platform.findMany({
            select : {id: true, name: true}
        })

        const accounts = await prisma.studentPlatformAccount.findMany({
            where: { userId: studentId},
            select: {platformId: true, handle: true, lastSyncedAt: true}
        });

        const accountMap = new Map(accounts.map((a) => [a.platformId, a]));
        const handles = platforms.map((p) => ({
            platformId: p.id,
            platformName: p.name,
            handle: accountMap.get(p.id)?.handle ?? null,
            lastSyncedAt: accountMap.get(p.id)?.lastSyncedAt ?? null


        }))
        return res.status(200).json({msg:"Handles fetched!", handles});
        
    } catch (error) {
        return res.status(500).json({msg:"Error fetching handles"});
    }
};

export const upsertHandle = async(req, res) => {
    const studentId = req.user?.id;
    if(!studentId) return res.status(401).json({msg : "Unauthorized"});

    const {platformId, handle} = req.body;
    if (!platformId || !handle.trim())  {
        return res.status(400).json({msg: "PlatformId and handle are required"});
    }

    try {
        const account = await prisma.studentPlatformAccount.upsert({
            where:  {userId_platformId : {userId: studentId, platformId}},
            update: {handle : handle.trim()},
            create:{userId:studentId, platformId, handle: handle.trim()},
            select:{ platformId :true, handle: true}
        });

        return res.status(200).json({
            msg: "handle saved",
            account
        });
        
    } catch (error) {
        return res.status(500).json({msg: "Error saving handle"});
        
    }

}


export const deleteHandle = async(req, res) => {
    const studentId = req.user?.id;
    if(!studentId) return res.status(401).json({msg: "Unauthorized"});
    const { platformId } = req.params;


    try {
        await prisma.studentPlatformAccount.delete({
            where: {userId_platformId: {userId: studentId, platformId} },
        });
        return res.status(200).json({ msg: "Handle Removed"});
        
    } catch (error) {
        return res.status(500).json({ msg : "Error removing handle"});
        
    }
}

export const generateSyncToken = async(req, res) => {
    const studentId = req.user?.id;
    if(!studentId) return res.status(401).json({ msg : "Unauthorized"});

    try {
        const syncToken = crypto.randomBytes(32).toString("hex");

        await prisma.user.update({
            where: {id: studentId},
            data: {syncToken}
        })
        return res.status(200).json({syncToken});
        
    } catch (error) {
        return res.status(500).json({msg : "Error generating sync token"})
        
    }
}


export const syncCF = async(req, res) => {
    const studentId  = req.user?.id;
    if(!studentId) return res.status(401).json({msg: "Unauthorized"});
    try {

        const studentBatch = await prisma.studentBatch.findFirst({
            where: {studentId},
        });
        if(!studentBatch) {
            return res.status(404).json({
                msg : "Student is not assigned any batch yet."
            })
        }

        const cfAccount = await prisma.studentPlatformAccount.findFirst({
            where: {
                userId : studentId,
                platform: {name: {contains: "codeforces", mode: "insensitive"}}
            },
            select: {id: true, handle: true}
        })

        if(!cfAccount) {
            return res.status(400).json({msg : "Codeforces handle not set"});
        }
        const assignments = await prisma.problemAssignment.findMany({
            where: {
                batchId: studentBatch.batchId,
                problem:{
                    platform:{ name: {contains: "codeforces", mode: "insensitive"}},
                }

            },
            include:{
                problem:{ select: {
                    id: true,
                    title: true, 
                    link: true
                }}
            }
        })

        if (!assignments.length) {
            return res.status(200).json({ msg: "No Codeforces problems in your batch", results: [] });
        }

        const results = await cfCheck(cfAccount.handle, assignments);

        await Promise.all(
            results.map((r) => 
            prisma.problemStatus.upsert({
                where: {
                    problemAssignmentId_studentId: { problemAssignmentId : r.assignmentId, studentId},

                },
                update: {
                    status: r.solved? "COMPLETED" :"PENDING",
                    syncedAt: new Date(),
                },
                create: {
                    problemAssignmentId: r.assignmentId,
                    studentId,
                    status: r.solved ? "COMPLETED" : "PENDING",
                    syncedAt : new Date()
                }
            })
        )
        );
        await prisma.studentPlatformAccount.update({
            where: {id: cfAccount.id},
            data : { lastSyncedAt : new Date()}
        })
         return res.status(200).json({ msg: "Codeforces sync complete", results });
        
    } catch (error) {
          console.error("[syncCF]", error);
          return res.status(500).json({ msg: error.message ?? "Error syncing Codeforces" });
        
        
    }
};

