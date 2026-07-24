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
//ผู้ใช้งานสามารถที่จะค้นหาคำถามจากหัวข้อ หรือหมวดหมู่ได้
questionRouter.get("/", async (req, res) => {
  const category = req.query.category;
  try {
    const results = await connectionPool.query(
      `select * from questions
       where 
       (category = $1 or $1 is null or $1 = '');`,
       [category]
       //category can be null, empty string, or key when client request 
    );
    return res.status(200).json({
      data: results.rows,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unable to fetch questions." });
  }
});

//ผู้ใช้งานสามารถที่จะดูคำถามแต่ละอันได้ ด้วย Id ของคำถามได้

questionRouter.get("/:questionId", async (req, res) => {
  try {
    const { questionId } = req.params;
    const results = await connectionPool.query(
      `select * from questions where id = $1`,
      [questionId]
    );
    if (!results.rows[0]) {
      return res.status(404).json({ message: "Question not found." });
    }
    return res.status(200).json({
      data: results.rows[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unable to fetch questions." });
  }
});

//ผู้ใช้งานสามารถสร้างคำตอบของคำถามนั้นได้
//คำตอบจะเป็นข้อความยาวๆ และต้องไม่เกิน 300 ตัวอักษร
questionRouter.post("/:questionId/answers", async (req, res) => {
  try {
    const { questionId } = req.params;
    const { content } = req.body;

    if (typeof content !== "string" || content.trim() === "" || content.length > 300) {
      return res.status(400).json({ message: "Invalid request data." });
    }

    const questionResult = await connectionPool.query(
      `select id from questions where id = $1`,
      [questionId]
    );

    if (!questionResult.rows[0]) {
      return res.status(404).json({ message: "Question not found." });
    }

    const answerResult = await connectionPool.query(
      `insert into answers (question_id, content)
       values ($1, $2)
       returning *`,
      [questionId, content.trim()]
    );

    return res.status(201).json({
      message: "Answer created successfully.",
      data: answerResult.rows[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unable to create answer." });
  }
});

//้ใช้งานสามารถที่จะแก้ไขหัวข้อ หรือคำอธิบายของคำถามได้
questionRouter.put("/:questionId", async (req, res) => {
  try {
    const questionIdfromClient = req.params.questionId;
    const updatedQuestion = { ...req.body }; //access to update question request from clients

    if (!updatedQuestion || typeof updatedQuestion !== "object") {
      return res.status(400).json({ message: "Invalid request data." });
    }

    const result = await connectionPool.query(
      `
      update questions
      set title = $2,
          description = $3,
          category = $4
      where id = $1
      `,
      [
        questionIdfromClient,
        updatedQuestion.title,
        updatedQuestion.description,
        updatedQuestion.category,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    return res.status(200).json({ message: "Question updated successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unable to fetch question." });
  }
});

//ผู้ใช้งานสามารถที่จะลบคำถามได้
//เมื่อลบคำถามออก คำตอบก็จะถูกลบตามคำถามนั้นๆ ไปด้วย
questionRouter.delete("/:questionId/answers", async (req, res) => {
  try {
    const questionId = Number.parseInt(req.params.questionId, 10);

    if (!Number.isInteger(questionId)) {
      return res.status(400).json({ message: "Invalid question id." });
    }

    const existingQuestion = await connectionPool.query(
      `select id from questions where id = $1`,
      [questionId]
    );

    if (existingQuestion.rowCount === 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    await connectionPool.query(
      `delete from answers where question_id = $1`,
      [questionId]
    );

    await connectionPool.query(
      `delete from questions where id = $1`,
      [questionId]
    );

    return res.status(200).json({
      message: "Question and its answers deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unable to delete question." });
  }
});

//ผู้ใช้งานสามารถที่จะดูคำตอบของคำถามแต่ละอันได้
questionRouter.get("/:questionId/answers", async (req, res) => {
  try {
    const { questionId } = req.params;
    const results = await connectionPool.query(
      `select * from answers where question_id = $1`,
      [questionId]
    //answer มีได้มากกว่า 1 (คนตอบกระทู้มากกว่า 1)
    );
    if (!results.rows[0]) {
      return res.status(404).json({ message: "Question not found." });
    }
    return res.status(200).json({
      data: results.rows[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unable to fetch answers." });
  }
});

export default questionRouter;