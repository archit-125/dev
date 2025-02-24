const { MANAGER } = require("./constants");

function formatEmailBody(ticketData) {
  let body = `Hi ${MANAGER}!<br>Here's a quick update on today's status:<br>`;

  ticketData.forEach(([status, tickets]) => {
    body += `<p><strong>${status}</strong></p>`;
    body += `<ul>`;

    tickets.forEach((ticket) => {
      body += `<li>${ticket}</li>`;
      if (status !== "Done") {
        body += `<ul><li>Comment : </li></ul>`;
      }
    });
    body += `</ul>`;
  });

  return body;
}

function sanitizeJiraTickets(tickets) {
  let groupedTickets = new Map();

  //Retain needed info from the API response
  let ticketArr = tickets.map(function (ticket) {
    return {
      ticketNumber: ticket.key.trim(),
      ticketTitle: ticket.fields.summary.trim(),
      ticketStatus: ticket.fields.status.name.trim(),
    };
  });

  //Group tickets based on ticket status
  for (let t of ticketArr) {
    if (groupedTickets.has(t.ticketStatus)) {
      let group = groupedTickets.get(t.ticketStatus);
      group.push(`${t.ticketNumber} : ${t.ticketTitle}`);
    } else {
      groupedTickets.set(t.ticketStatus, [
        `${t.ticketNumber} : ${t.ticketTitle}`,
      ]);
    }
  }

  //sort on ticket status
  //Structure : [ ['status1',['Ticket1', 'Ticket2']], ['status2',['Ticket3', 'Ticket4','Ticket5]] ]
  let sortedGroupedTickets = [...groupedTickets.entries()].sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  return sortedGroupedTickets;
}

module.exports = {
  sanitizeJiraTickets,
  formatEmailBody,
};
