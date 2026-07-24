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
questionRouter.delete("/:questionId", async (req, res) => {
  try {
    const questionIdfromClient = req.params.questionId;
    const result = await connectionPool.query(
      `delete from questions
      where id = $1`,
      [questionIdfromClient]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    return res.status(200).json({
      message: "Question post has been deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unable to delete question." });
  }
});

//ผู้ใช้งานสามารถที่จะค้นหาคำถามจากหัวข้อ หรือหมวดหมู่ได้

export default questionRouter;