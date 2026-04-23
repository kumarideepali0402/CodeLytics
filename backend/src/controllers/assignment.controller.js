

import prisma from "../db/prisma.js";

export const createTopic = async(req, res) => {
  const teacherId = req.user?.id;

  if(!teacherId) {
    return res.status(401).json({msg : "Teacher Authentication Failed"});
  }

  const { name } = req.body;
  const trimmedName = typeof name === "string" ? name.trim() : "";
  if (!trimmedName) {
    return res.status(400).json({ msg: "Name is required." });
  }

  try {
    const topic = await prisma.topic.create({
      data: {
        name: trimmedName,
        createdBy : teacherId
      },
      select: {
        id: true,
        name: true,
        createdBy: true,
      },
    });

    return res.status(201).json({
      msg: "Topic created successfully!",
      topic,
    });
  } catch (error) {
    return res.status(400).json({
      msg: "Error creating the topic",
    });
    
  }
}

export const getAllTopics = async(req, res) => {
  const  teacherId  = req.user?.id;
  if(!teacherId) {
    return res.status(401).json({msg: "Failed to authenticate Teacher"});
  }

  try {
    const topics = await prisma.topic.findMany({
      where : { createdBy : teacherId },
      select : {
        name : true,
        id : true
      }

    })

    
    return res.status(200).json({
      msg : "Topics fetched successfully!",
      topics
    })
    
  } catch (error) {
    console.log(error); 
    return res.status(500).json({
      msg: "Error fetching topics"
    })
    
  }



}


export const createSubtopic = async(req, res) => {
    const teacherId  = req.user?.id;
    if (!teacherId) {
      return res.status(401).json({
        msg : "Failed to authenticate teacher"
      })
    }

    const {topicId, name} = req.body;
    const trimmedTopicId = typeof topicId === "string" ? topicId.trim() : topicId;
    const trimmedName = typeof name === "string" ? name.trim() : name;
    if(!trimmedTopicId || !trimmedName) {
      return res.status(400).json({
        msg: "TopicId and name is required for making subtopic" 
      })
    }

    try {
      const topic = await prisma.topic.findUnique({
        where: { id: trimmedTopicId },
      });

      if (!topic) {
        return res.status(404).json({ msg: "Topic not found" });
      }

      if (topic.createdBy !== teacherId) {
        return res.status(403).json({
          msg: "You can't create subtopics for this topic.",
        });
      }

      const subTopic = await prisma.subtopic.create({
        data: {
          topicId: trimmedTopicId,
          name: trimmedName,
          createdBy: teacherId,
        },
        select: {
          id: true,
          name: true,
          topicId: true,
        },
      });

      return res.status(201).json({
        msg: "Subtopic created Successfully!",
        subTopic,
      });
    } catch (error) {
      return res.status(500).json({
        msg: "Error creating subtopics",
      });
    }

}


export const getAllSubtopics = async(req, res) => {
  
  const teacherId = req.user?.id;

  if(!teacherId) {
    return res.status(401).json({
      msg : "Failed to authenticate Teacher"
    })
  } 

  const topicId  = req.params.topic_id;

  if(!topicId){
    return res.status(400).json({
      msg : "topicId is required"
    })
  }

  try {
    const subTopics = await prisma.topic.findUnique(
      {
        where: {id : topicId},
        include:{
          subtopics:{
            select : {
              id: true,
              name : true

            }
          }
        }
      }
    )
    if(!subTopics){
      return res.status(404).json({
      msg : "subtopics doesnt exist",
      
    })} 
    if(subTopics.createdBy !== teacherId){
      return res.status(404).json({
      msg : "subtopics doesnt exist",
      
    })
    
    

    }
    return res.status(200).json({
      msg : "Fetched all subtopics",
      subTopics: subTopics.subtopics
    })
    
  } catch (error) {
    console.log(error);
     return res.status(500).json({
      msg : "Failed to Fetched all subtopics",
      
    })

    
  }

}


export const createProblem = async(req, res) => {
  
  const teacherId = req.user?.id;
  if(!teacherId) {
    return res.status(401).json({
      msg : "Failed to authenticate teacher"
    })
  }
  
  const { title, link, difficulty, platformId } = req.body;
  const trimmedTitle  = typeof title === 'string' ? title.trim() : title;
  const trimmedLink  = typeof link === 'string' ? link.trim() : link;
  const trimmedDifficulty = typeof difficulty === 'string' ? difficulty.trim(): difficulty;
  const trimmedPlatformId = typeof platformId === 'string' ? platformId.trim(): platformId;
 
  

  if ( !trimmedTitle|| !trimmedLink|| !trimmedDifficulty|| !trimmedPlatformId ) {
    return res.status(400).json({
      msg: " Title, Link, difficulty, platform Id is required"
    })
  }
  try {
    


    const problem = await prisma.problem.create({
      data: { 
        title: trimmedTitle, 
        link : trimmedLink,
        difficulty: trimmedDifficulty,
        platform: { connect: {id: trimmedPlatformId}},
        addedByUser: {connect: {id: teacherId}}
      }


    })

    return res.status(201).json({
      msg : "Problem creating successfully!",
      problem
     })
    

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg : "Error creating the Problem!",
     })
  }


}

export const getAllProblems = async(req, res) => {


  const teacherId = req.user?.id;

  if(!teacherId) {
    return res.status(401).json({
      msg : "Failed to authenticate teacher"
    })
  }

  try {
    const problems = await prisma.problem.findMany({
      where: { addedBy : teacherId },
      select: {
        id : true,
        title :true,
        link : true,
        platformId:true,
        difficulty: true 
      }
    })

    return res.status(200).json({
      msg : "Problems fetched Successfully!",
      problems
    })
    
  } catch (error) {
    return res.status(500).json({
      msg : "Error fetching the problem!",
      
    })
    
  }

}


export const getAssignedProblems = async (req, res) => {
  const teacherId = req.user?.id;
  if (!teacherId) return res.status(401).json({ msg: "Failed to authenticate teacher" });

  const { batch_id: batchId, subtopic_id: subtopicId } = req.params;
  if (!batchId || !subtopicId) {
    return res.status(400).json({ msg: "batchId and subtopicId are required" });
  }

  try {
    const assignments = await prisma.problemAssignment.findMany({
      where: { batchId, subtopicId, assignedBy: teacherId },
      include: {
        problem: {
          select: {
            id: true,
            title: true,
            link: true,
            difficulty: true,
            platform: { select: { name: true } },
          },
        },
      },
    });

    const problems = assignments.map((a) => ({
      problemId: a.problem.id,
      name: a.problem.title,
      link: a.problem.link,
      difficulty:
        a.problem.difficulty.charAt(0) + a.problem.difficulty.slice(1).toLowerCase(),
      platform: a.problem.platform?.name ?? "—",
    }));

    return res.status(200).json({ msg: "Assigned problems fetched", problems });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Error fetching assigned problems" });
  }
};

export const assignHomework = async (req, res) => {
  const teacherId = req.user?.id;
  if (!teacherId) {
    return res.status(401).json({ msg: "Failed to authenticate!" });
  }

  const { problemId, batchId, topicId, subTopicId, } = req.body;
  const trimmedProblemId =typeof problemId === "string" ? problemId.trim() : problemId;
  const trimmedBatchId = typeof batchId === "string" ? batchId.trim() : batchId;
  const trimmedSubTopicId  = typeof subTopicId === 'string' ? subTopicId.trim(): subTopicId;
  const trimmedTopicId  = typeof topicId === 'string' ? topicId.trim(): topicId;

  if (!trimmedProblemId || !trimmedBatchId ||!trimmedSubTopicId ||!trimmedTopicId) {
    return res.status(400).json({
      msg: "problemId, batchId , subtopicId, topicId is required",
    });
  }

  try {

    const topic  = await prisma.topic.findUnique({
      where: {id: trimmedTopicId}
    })

    if(!topic || topic.createdBy !== teacherId) {
      return res.status(400).json({
        msg: "Topic doesn't exist "
      })
    }
    const subTopic  = await prisma.subtopic.findUnique({
      where: {id: trimmedSubTopicId}
    })
    if(!subTopic || subTopic.createdBy !== teacherId || subTopic.topicId !== trimmedTopicId) {
      return res.status(400).json({
        msg: "SubTopic doesn't exist "
      })
    }

    const problem = await prisma.problem.findUnique({
      where: { id: trimmedProblemId },
    });
    if (!problem) {
      return res.status(404).json({ msg: "Problem not found" });
    }
    if (problem.addedBy !== teacherId) {
      return res.status(403).json({ msg: "You cannot assign this problem" });
    }

    const batch = await prisma.batch.findUnique({
      where: { id: trimmedBatchId },
    });
    if (!batch) {
      return res.status(404).json({ msg: "Batch not found" });
    }

    const teacherBatch = await prisma.teacherBatch.findUnique({
      where: {
        teacherId_batchId: {
          teacherId,
          batchId: trimmedBatchId,
        },
      },
    });
    if (!teacherBatch) {
      return res.status(403).json({ msg: "You dont have access to the batch" });
    }

    const existing = await prisma.problemAssignment.findFirst({
      where: {
        problemId: trimmedProblemId,
        batchId: trimmedBatchId,
        topicId: trimmedTopicId,
        subtopicId: trimmedSubTopicId
      },
    });
    if (existing) {
      return res.status(409).json({
        msg: "Problem already assigned to this batch",
      });
    }

    const homework = await prisma.problemAssignment.create({
      data: {
        problemId: trimmedProblemId,
        batchId: trimmedBatchId,
        assignedBy: teacherId,
        topicId: trimmedTopicId,
        subtopicId: trimmedSubTopicId
      },
      include: {
        problem: {
          select: {
            id: true,
            title: true,
            link: true,
            difficulty: true,
          
          },
        },
        batch: { select: { id: true, name: true } },
      },
    });

    return res.status(201).json({
      msg: "Problem assigned successfully!",
      homework,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Error assigning homework" });
  }
};

export const getBatchOutline = async (req, res) => {
  const userId = req.user?.id;
  if(!userId) return res.status(401).json({ msg : "Unauthorized"});
  
  const {batch_id:batchId} = req.params;
  if(!batchId) {
    return res.status(400).json({ msg: "BatchId is required"});
  }

  try {
    const assignments = await prisma.problemAssignment.findMany({
      where: {batchId},
      include: {
        topic: {
          select:{
              id: true,
              name: true
          }
        },
        subtopic: {
          select: {
            id: true,
            name: true

          }
        },
        problem: {
          select: {
            id: true,
            title: true,
            link: true,
            difficulty: true,
            platform: { select: {name : true}}
          }

        }
      }
    });
    const topicMap = new Map();
    for (const a of assignments){
      if(!topicMap.has(a.topicId)){
        topicMap.set(a.topic.id, {id:a.topicId, title: a.topic.name, subtopics: new Map()});


      }

      const classMap = topicMap.get(a.topicId).subtopics;
      if(!classMap.get(a.subtopicId)){
        classMap.set(a.subtopicId, {id:a.subtopicId, title: a.subtopic.name, problems: []});

      }

      const d = a.problem.difficulty;
      classMap.get(a.subtopicId).problems.push({
        name: a.problem.title,
        link: a.problem.link,
        difficulty: d.charAt(0) + d.slice(1).toLowerCase(),
        platform: a.problem.platform?.name ?? "-",
      });
    }

    const outline = [...topicMap.values()].map((t)=>({
      id: t.id,
      title: t.title,
      subtopics: [...t.subtopics.values()],
    }));
    
    return res.status(200).json({msg: "Outline fetched", outline});
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({msg: "Error fetching batch outline"});
    
  }


}






