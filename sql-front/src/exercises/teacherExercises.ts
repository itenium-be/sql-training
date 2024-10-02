import { ExerciseModel } from "./exerciseModels";

export const teacherExercises: ExerciseModel = {
  id: 'Teachers',
  name: 'Teachers & Departments',
  sampleQuery: 'SELECT t.name, t.phone, t.mobile, t.salary, employed_at, birth_date, d.name as dept_name, d.phone as dept_phone FROM teachers t JOIN departments d ON t.dept=d.id',
  desc: 'Be social, join tables! (postgres)',
  exercises: [
    {
      id: 1,
      desc: 'Display the deparments and the number of staff',
      points: 1,
      expected: [
        ["Design", 1],
        ["Computing", 3],
        ["Engineering", 0],
      ],
      expectedOrder: false,
      expectedColumns: ['name', 'count']
    },
    {
      id: 2,
      desc: 'List all teachers with their department. Display "None" if they do not belong to a department.',
      points: 2,
      expected: [
        ["Splint", "Computing"],
        ["Throd", "Computing"],
        ["Shrivell", "Computing"],
        ["Cutflower", "Design"],
        ["Deadyawn", "None"],
        ["Spiregrain", "None"],
      ],
      expectedOrder: false,
      expectedColumns: ['name', 'dept_name']
    },
    {
      id: 3,
      desc: 'Show the name of the teacher and, depending on the department, show "Sci", "Art" or "None".',
      points: 2,
      expected: [
        ['Splint', 'Sci'],
        ['Throd', 'Sci'],
        ['Shrivell', 'Sci'],
        ['Cutflower', 'Art'],
        ['Deadyawn', 'None'],
        ['Spiregrain', 'None'],
      ],
      expectedOrder: false,
      expectedColumns: ['name', 'department type']
    },
    {
      id: 4,
      desc: "Show all teachers and their mobile number. If they don't have one, fallback to their extension and if they don't have an office, fallback to the department extension. We need to be able to call them right away, so phone numbers must start with +32 and be without any spaces. The school number is 09 331 0000",
      points: 4,
      expected: [
        ['Shrivell', '+32476403509'],
        ['Throd', '+32477996655'],
        ['Splint', '+3293312793'],
        ['Spiregrain', '+32799555657'],
        ['Cutflower', '+3293313200'],
        ['Deadyawn', '+3293313345'],
      ],
      expectedOrder: false,
      expectedColumns: ['name', 'phone']
    },
    {
      id: 5,
      desc: 'Select all teacher with a name starting with "S" and their seniority (in years)',
      points: 2,
      expected: [
        ['Shrivell', 23],
        ['Splint', 2],
        ['Spiregrain', 25],
      ],
      expectedOrder: false,
      expectedColumns: ['name', 'seniority']
    },
    {
      id: 6,
      desc: 'Show the teacher names with a birthday today (3/10)',
      points: 2,
      expected: [
        ['Throd']
      ],
      expectedOrder: false,
      expectedColumns: ['name']
    },
    {
      id: 7,
      desc: 'Select the department name and the top 2 earners with their salary (include department-less teachers). Sort by department and highest salary.',
      points: 5,
      expected: [
        ['Computing', 'Splint', 3000],
        ['Computing', 'Throd', 2000],
        ['Design', 'Cutflower', 1000],
        [null, 'Deadyawn', 2000],
        [null, 'Spiregrain', 1000],
      ],
      expectedOrder: true,
      expectedColumns: ['department', 'name', 'salary'],
      hints: 'You may want to look at the RANK() Window Function.'
    },
    {
      id: 8,
      desc: 'Looking at the result of the previous exercise, there was only one record for the "Design" department. Adjust the query so that it adds an extra Design row with NULL values.',
      points: 2,
      expected: [
        ['Computing', 'Splint', 3000],
        ['Computing', 'Throd', 2000],
        ['Design', 'Cutflower', 1000],
        ['Design', null, null],
        [null, 'Deadyawn', 2000],
        [null, 'Spiregrain', 1000],
      ],
      expectedOrder: true,
      expectedColumns: ['department', 'name', 'salary']
    },
  ],
}
