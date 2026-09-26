# Claude Code Tips

From Nick Saraev, "I Spent $31,141 & 1,000 Hours On Claude Code. I Learned This"
https://youtu.be/45K3zHckCnQ

Each session start shows one random tip from the list below. One tip per line,
starting with `- `. Add your own in the same format and they join the rotation.

## Tips

- **Don't trust the first output (0:29).** Claude gives different results each run. Before you save a prompt as a routine, run it several times, count how many runs were good (e.g. 7/10), tweak it, and keep the version that scores higher.
- **Give Claude a way to check its own work (3:19).** A first draft is only a first draft. Ask for a self-check and revision loop against something concrete: a screenshot, an example to compare with, or a test like Lighthouse for the website.
- **Let the code be the context (4:38).** Separate notes, specs and logs go stale as the code changes. Put the important explanations as comments inside the code itself, and keep CLAUDE.md for preferences and lessons.
- **Let Claude write your prompt (6:38).** For bigger jobs, say "I want X for Y audience, help me write a prompt for it." Answer Claude's questions (who's it for, what does great look like, examples), then use the prompt it writes.
- **Watch what is eating your context (8:11).** Type /context to see what's filling Claude's memory. Turn off connectors and skills you aren't using, and run /compact early rather than waiting for auto-compact.
- **Loosen the leash (10:11).** Treat Claude like a skilled contractor, not a new hire. Skip the step-by-step instructions and give a clear "definition of done": you're finished when this, this and this are true. Ask me if unsure.
- **Diagnose before you fix (11:54).** Don't say "it's broken, fix it." Say "List all the problems. Don't change anything yet." Then cross out the ones you don't care about and ask it to fix only the rest.
- **Prototype with connectors, then slim down (13:01).** Connectors (MCP) are great for proving something works in one click, but they're heavy on context and slow startup. Once a workflow is proven, turn it into a lean custom skill and prune unused connectors.
- **Run scoped tasks in parallel (14:56).** Instead of one task at a time, list several separate jobs (e.g. new post, nav fix, footer tweak) and say "do these in parallel as mutually exclusive scoped tasks, then merge."
- **Start fresh with a handoff note (16:50).** When a long chat gets muddled, ask "Summarise where we are: what's done, decisions I need to make, what's next, open problems." Fix anything wrong, then paste it into a brand-new session.
- **Ask side questions with /btw (17:52).** While Claude is busy on a long task, type /btw followed by your question. It answers without interrupting the main work or cluttering its context.
- **Fan out, then fan in (19:01).** For research-heavy tasks, ask Claude to send cheap sub-agents out to gather as much as possible, then combine it all so the strong model makes the final call. More coverage, less cost.
- **Keep CLAUDE.md lean and current (20:53).** Check it now: delete anything outdated. Keep a short "what's where" map (/init makes one), your preferences, and lessons learned. Review it every time the model updates.
- **Keep a backup tool ready (22:17).** Outages happen. Keep instructions in a file other tools can read too (AGENTS.md, which Claude now also understands), so another AI tool can pick up where Claude left off.
- **Have Claude learn from its mistakes (23:52).** After a task, ask "How could you have done that faster with fewer tokens?" Save the answer to CLAUDE.md as a positive rule (what to do), not just a list of don'ts.
