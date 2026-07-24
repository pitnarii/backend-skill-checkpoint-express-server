import { Router } from "express";
import connectionPool from "../utils/db.mjs";

const questions = [];
const questionRouter = Router();

//ผู้ใช้งานสามารถสร้างคำถามได้
questionRouter.post("/", async (req, res) => {
  try {
    const newQuestion = req.body;
    await connectionPool.query(
      `insert into questions (title, description, category)
       values ($1, $2, $3)`,
      [
        newQuestion.title,
        newQuestion.description,
        newQuestion.category,
      ],
    );
    if (!newQuestion || typeof newQuestion !== "object") {
      return res.status(400).json({ message: "Invalid request data." });
    }

    const newQuestionId = questions.length === 0 ? 1 : questions[questions.length - 1].id + 1;
    //0 (if question is empty) 

    questions.push({
      id: newQuestionId,
      ...newQuestion,
    });

    return res.status(201).json({ message: "Question created successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unable to create question." });
  }
});

//ผู้ใช้งานสามารถที่จะดูคำถามทั้งหมดได้
questionRouter.get("/", async (req, res) => {
  try {
    const results = await connectionPool.query(`select * from questions`);
    return res.status(200).json({
      data: results.rows,
    });
  } catch (error) {
    console.error(err); 
    return res.status(500).json(
      {"message": "Unable to fetch questions."}
    );
  }
})

//ผู้ใช้งานสามารถที่จะดูคำถามแต่ละอันได้ ด้วย Id ของคำถามได้

questionRouter.get("/:questionID", async (req, res) => {
  try {
    const { questionID } = req.params;
    const results = await connectionPool.query(
      `select * from questions where id = $1`,
      [questionID]
    );
    if (!results.rows[0]) {
      return res.status(404).json({ "message": "Question not found." });
    }
    return res.status(200).json({
      data: results.rows[0],
    });
  } catch (err) {
    console.error(err); 
    return res.status(500).json(
      { "message": "Unable to fetch questions." }
    );
  }
});

//้ใช้งานสามารถที่จะแก้ไขหัวข้อ หรือคำอธิบายของคำถามได้



export default questionRouter;