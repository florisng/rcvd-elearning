import pool from "../config/db.js";

const getCourseRequiredTime = async (courseId) => {
  const result = await pool.query(
    `SELECT COALESCE(SUM(
       (
         SELECT COALESCE(SUM(
           array_length(
             regexp_split_to_array(
               NULLIF(
                 trim(
                   regexp_replace(s.content, '<[^>]*>', ' ', 'g')
                 ),
                 ''
               ),
               '\\s+'
             ),
             1
           )
         ), 0)
         FROM subchapters s
         WHERE s.chapter_id = c.id
       )
     ), 0) AS word_count
     FROM chapters c
     WHERE c.course_id = $1`,
    [courseId],
  );

  const wordCount = parseInt(result.rows[0].word_count, 10) || 0;

  return Math.ceil((wordCount / 200) * 120);
};

export default getCourseRequiredTime;
