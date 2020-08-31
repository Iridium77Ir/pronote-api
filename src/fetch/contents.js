const { toPronoteWeek } = require('../data/dates');
const { getFileURL } = require('../data/files');

const getContents = require('./pronote/contents');

async function contents(session, from = new Date(), to = null)
{
    if (!to || to < from) {
        to = new Date(from.getTime());
        to.setDate(to.getDate() + 1);
    }

    const fromWeek = toPronoteWeek(session, from);
    const toWeek = toPronoteWeek(session, to);

    const contents = await getContents(session, fromWeek, toWeek);
    if (!contents) {
        return null;
    }

    const result = [];

    for (const lesson of contents.lessons) {
        if ((lesson.from).getTime() < from.getTime() || (lesson.to).getTime() > to.getTime()) {
            continue;
        }

        const content = lesson.content[0]; // Maybe on some instances there will be multiple entries ? Check this
        result.push({
            subject: lesson.subject.name,
            teachers: lesson.teachers.map(t => t.name),
            from: lesson.from,
            to: lesson.to,
            color: lesson.color,
            title: content.name,
            description: content.description.replace('<br/>', '\n'),
            files: content.files.map(f => ({ name: f.name, url: getFileURL(session, f) })),
            category: content.category.name
        });
    }

    return result.sort((a, b) => a.from - b.from);
}

module.exports = contents;
