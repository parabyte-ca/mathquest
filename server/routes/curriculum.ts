import { Router } from 'express';
import type { Ctx } from '../context.js';

/** Read-only curriculum data for any signed-in user (skill map and pickers read from here). */
export function curriculumRoutes(ctx: Ctx): Router {
  const r = Router();

  r.get('/curriculum/expectations', (req, res) => {
    if (!req.auth) return void res.status(401).json({ error: 'unauthenticated' });
    const grade = Number(req.query.grade);
    const course = typeof req.query.course === 'string' ? req.query.course.toUpperCase().slice(0, 8) : null;
    const rows = ctx.db
      .prepare(
        `SELECT code, grade, course, strand, strand_name AS strandName, substrand, text FROM curriculum_expectation
         WHERE (? IS NULL OR grade = ?) AND (? IS NULL OR course = ?) ORDER BY code`,
      )
      .all(Number.isInteger(grade) ? grade : null, Number.isInteger(grade) ? grade : null, course, course);
    res.json({ expectations: rows });
  });

  r.get('/curriculum/graph', (req, res) => {
    if (!req.auth) return void res.status(401).json({ error: 'unauthenticated' });
    res.json({
      edges: ctx.db.prepare('SELECT from_code AS "from", to_code AS "to", chain FROM prereq_edge').all(),
      coursePrereqs: ctx.db.prepare('SELECT course, recommended FROM course_prereq').all(),
      microskills: ctx.db.prepare('SELECT id, expectation, name, tiers FROM microskill').all(),
      microskillPrereqs: ctx.db.prepare('SELECT microskill, prereq FROM microskill_prereq').all(),
    });
  });

  return r;
}
