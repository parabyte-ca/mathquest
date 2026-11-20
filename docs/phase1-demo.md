# Phase 1 demo script (2.0.0)

Time: about 10 minutes. You need an email inbox you control and a second device (or a private browser window).

1. **Install.** On TrueNAS: `sudo ./setup.sh`. Enter your Resend key, sender and admin email. It prints "MathQuest is healthy" and emails you a link.
2. **Admin sign-in.** Open the link in the same browser you will use next. You land on the admin-capable home page (an "Admin" link is in the header). Opening the same link again must fail ("invalid, already used or expired").
3. **Invite a caregiver.** Admin -> "Invite a caregiver", enter a second email. That person receives a sign-in link and can open it in any browser.
4. **Add a student.** Signed in as a caregiver: fill in display name, username, 4-digit PIN, grade, language -> "Create student".
5. **Approve a device.** On the student's device open `/app/student` -> "Get a code". On the caregiver page enter the 6-digit code under "Approved devices" -> "Approve device". The student's screen switches to the sign-in form within a few seconds.
6. **Student PIN login.** Enter the username and PIN. A wrong PIN shows how many tries are left; five wrong tries pause sign-in for 15 minutes and email the caregiver.
7. **Share a student.** On the student's row, enter another caregiver's email under "Share with another caregiver". They see the student; only the owner can delete.
8. **Privacy.** "Export data" downloads the student's JSON; "Delete" removes the student and everything linked to them.
9. **Language.** Click "Français" in the header; the whole interface switches.
10. **Updates page (admin).** Admin -> Updates shows the installed version, the latest release and notes. When a newer release exists, "Upgrade" writes a request; within a minute the status moves through Checking, Updating and Succeeded, and the log appears under "Upgrade log".
11. **Rollback drill.** `sudo ./update.sh --rollback` returns to the previous tag and the pre-update database.

What is not in this phase: lessons, the question player, generators, rewards, themes, the caregiver dashboard and printable worksheets (Phases 2-4).
