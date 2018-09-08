const formContactsRow = contacts => {
  return contacts.map(contact => {
    const emailMatched = contact.match(/<(.*)>/);
    const email = emailMatched ? emailMatched[1] : contact;
    const name = emailMatched
      ? contact.slice(0, contact.indexOf('<') - 1)
      : null;
    return { email, name };
  });
};

const dateDiffInDays = (firstDate, secondDate) => {
  const millisecondsInADay = 1000 * 60 * 60 * 24;
  return Math.round((secondDate - firstDate) / millisecondsInADay);
};

module.exports = {
  formContactsRow,
  dateDiffInDays
};
