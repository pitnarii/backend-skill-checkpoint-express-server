import { Router } from "express";
import connectionPool from "../utils/db.mjs";

const answers = [];
const answerRouter = Router();

//- ผู้ใช้งานสามารถที่จะลบคำถามได้
//- เมื่อลบคำถามออก คำตอบก็จะถูกลบตามคำถามนั้นๆ ไปด้วย
answerRouter.delete("/:questionId", async (req, res) => {
  try {
    const { questionId } = req.params;

    const result = await connectionPool.query(
      `delete from answers where question_id = $1`,
      [questionId]
    );

    return res.status(200).json({
      message: "Answers deleted successfully.",
      deletedCount: result.rowCount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unable to delete answers." });
  }
});

export default answerRouter;
