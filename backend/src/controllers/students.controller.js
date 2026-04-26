import bcrypt from "bcrypt";
import prisma from "../db/prisma.js";

export const getMyProfile = async (req, res) => {
  const studentId = req.user?.id;
  if (!studentId) return res.status(401).json({ msg: "Unauthorized" });

  try {
    const user = await prisma.user.findUnique({
      where: { id: studentId },
      select: {
        name: true,
        email: true,
        studentEnrollmentId: true,
        studentStreak: true,
        studentBatch: {
          select: { batch: { select: { name: true } } },
          take: 1,
        },
      },
    });

    if (!user) return res.status(404).json({ msg: "Student not found" });

    return res.status(200).json({
      profile: {
        name: user.name,
        email: user.email,
        enrollmentId: user.studentEnrollmentId ?? "—",
        streak: user.studentStreak,
        batch: user.studentBatch[0]?.batch?.name ?? "—",
      },
    });
  } catch (error) {
    return res.status(500).json({ msg: "Error fetching profile" });
  }
};

export async function createStudent(req, res) {
  const collegeId = req.user?.id;
  if (!collegeId) {
    return res.status(400).json({ msg: "College authentication failed!" });
  }

  const { name, email, password, batchId } = req.body;

  const trimmedName = typeof name === "string" ? name.trim() : "";
  const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (!trimmedName || !trimmedEmail || !password || !collegeId || !batchId) {
    return res.status(400).json({ msg: "name, email, password, batchId is required!" });
  }
  if (password.length < 6) {
    return res.status(400).json({ msg: "Password length should be atleast of length 6" });
  }

  try {
    const batch = await prisma.batch.findFirst({
      where: { id: batchId, collegeId },
    });
    if (!batch) {
      return res.status(404).json({
        msg: "Batch not found or doesn't belong to your college.",
      });
    }

    const existing = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });
    if (existing) {
      return res.status(409).json({ msg: "User already exist" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await prisma.$transaction(async(tx) => {
      const user = await tx.user.create({
        data:{
          name : trimmedName,
          passwordHash: hashedPassword,
          collegeId,
          email: trimmedEmail,
          role: "STUDENT"
        },

        select: {
          id: true,
          name: true,
          email: true,
          collegeId: true,
          role: true,
        }

      })

      await tx.studentBatch.create({data:{batchId, studentId: user.id}});
      return user;
    })
    return res.status(201).json({
      msg: "Student created Successfully!",
      student,
    });
  } catch (error) {
    console.error("[createStudent]", error);
    return res.status(500).json({ msg: "Error in creating the student" });
  }
}


export async function getBatchStudent(req, res){
  const collegeId = req.user?.id;
  if(!collegeId){
    return res.status(400).json({ msg: "College authentication failed!" });

  }

  const batchId = req.params.id;
  if(!batchId){
    return res.status(400).json({ msg: "Batch authentication failed!" });

  }
  let batchName ;
  try {
    const batch = await prisma.batch.findFirst({
      where: { id: batchId, collegeId },
      select: { id: true , name: true},
    });

    if(!batch) return res.status(404).json({
      msg : "Batch doesn't exist in college"
    })
    batchName = batch.name;
    
  } catch (error) {
    console.error("[getBatchStudent] batch lookup:", error);
    return res.status(400).json({
      msg: "Error occurred while searching batch in college",
      ...(process.env.NODE_ENV !== "production" && { error: error?.message }),
    });
  }
  
  try {
    const students = await prisma.studentBatch.findMany({
      where: {batchId},
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            studentEnrollmentId: true,
          },
        }
      }
    })
    return res.status(200).json({
      msg: "Students fetched successfully",
      students,
      batchName,
    });

    
    
  } catch (error) {
       return res.status(500).json({ msg: "Error in fetching the student" });
  }
}

export const getMyBatchOutline = async (req, res) => {
  const studentId = req.user?.id;
  if (!studentId) return res.status(401).json({ msg: "Unauthorized" });

  try {
    const studentBatch = await prisma.studentBatch.findFirst({
      where: { studentId },
    });
    if (!studentBatch) return res.status(404).json({ msg: "You are not enrolled in any batch" });

    const batchId = studentBatch.batchId;

    const assignments = await prisma.problemAssignment.findMany({
      where: { batchId },
      include: {
        topic: { select: { id: true, name: true } },
        subtopic: { select: { id: true, name: true } },
        problem: {
          select: {
            id: true, title: true, link: true, difficulty: true,
            platform: { select: { name: true } },
          },
        },
        problemStatuses: {
          where: { studentId },
          select: { status: true}
        }
      },
    });

    const topicMap = new Map();
    for (const a of assignments) {
      if (!topicMap.has(a.topicId)) {
        topicMap.set(a.topic.id, { id: a.topicId, title: a.topic.name, subtopics: new Map() });
      }
      const classMap = topicMap.get(a.topicId).subtopics;
      if (!classMap.get(a.subtopicId)) {
        classMap.set(a.subtopicId, { id: a.subtopicId, title: a.subtopic.name, problems: [] });
      }
      const d = a.problem.difficulty;
      classMap.get(a.subtopicId).problems.push({
        name: a.problem.title,
        link: a.problem.link,
        difficulty: d.charAt(0) + d.slice(1).toLowerCase(),
        platform: a.problem.platform?.name ?? "-",
        assignmentId: true,
        dbSolved : a.problemStatuses[0]?.status === "COMPLETED"

      });
    }

    const outline = [...topicMap.values()].map((t) => ({
      id: t.id,
      title: t.title,
      subtopics: [...t.subtopics.values()],
    }));

    return res.status(200).json({ msg: "Outline fetched", outline, batchId });
  } catch (error) {
    console.error("[getMyBatchOutline]", error);
    return res.status(500).json({ msg: "Error fetching batch outline" });
  }
};

