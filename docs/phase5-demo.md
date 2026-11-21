# Phase 5 demo script (2.4.0): polish

Time: about 15 minutes.

1. **Caregiver tour.** Sign in as a caregiver who has not seen it. A "Quick tour" card appears at the top: add a student, approve a device with the pairing code, goals and limits, progress, sharing, your data. Each step highlights the part of the page it is about. Use Next and Back, press Escape or "Skip the tour" to close it. It does not come back by itself; the **Help** link at the top replays it (focus moves to the tour when you ask for it).
2. **Student tour.** Sign in as a student for the first time. The tour covers topics, lessons, hints, the scratchpad and keyboard, the skill map, read aloud and XP. Switch to Français: the tour is in French too. Skipping is remembered on the server, so it follows the student to another device.
3. **Invitation note (admin).** In Admin, invite a caregiver and write a short note. The email quotes it above the sign-in link. Notes with a link or web address are refused. The audit log says a note was attached, not what it said.
4. **Share with a note (caregiver).** Share a student with a new email address and add a note; an existing account is simply linked.
5. **Updates page (admin).** Open Admin. You see whether the upgrade helper on the server has checked in, release notes for every version between yours and the latest, and, during an upgrade, the steps with the current one marked. After an upgrade you see the result, the previous version, the times, the backup file name and how to roll back. A failure names the stage and the reason in plain words.
6. **Install the app.** In a browser that supports it (Chrome, Edge, Safari "Add to Home Screen"), install MathQuest. It opens in its own window with the MathQuest icon.
7. **Offline.** Turn off Wi-Fi with the app open or installed. The app still opens and says you are offline; practice and sign-in need a connection. Turn it back on and the notice goes away. Nothing from the server's API is stored on the device by the app.
8. **Speed.** The first screen is about 97 kB of script instead of 728 kB; practice, lessons, the skill map, admin, progress and worksheets load when first opened.

What is not in this release: offline practice (answering without a connection), Grades 7 to 12 content.
