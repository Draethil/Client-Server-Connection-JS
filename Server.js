const WebSocket = require('ws')

const wss = new WebSocket.Server({ port: 9000 })

const readline = require("readline")
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

let clientList = []
let ticketList = []

function client(clientId, connection) {
    this.clientId = clientId
    this.connection = connection
}

function ticket(ticketId, ticketTaken, clientId) {
    this.ticketId = ticketId
    this.ticketTaken = ticketTaken
    this.clientId = clientId
}

console.log('Server started...\n\nNo Tickets\nn: new ticket, q: quit')
inputServer()

wss.on('connection', ws => {
    ws.on('message', jsonObj => {
        const message = JSON.parse(jsonObj);

        if(typeof message === "string") {
            console.log('\nNew Client: ' + message)
            var temp = new client(message,ws)
            clientList.push(temp)
            printTickets()
            let myJson = JSON.stringify(ticketList)
            ws.send(myJson)
        } else {
            selfAssignment(message,ws)
            sendTicketList()
        }
    })

    ws.on('close', _ => {
        for(var i = 0; i < clientList.length; i++) {
            if(clientList[i].connection === ws) {
               console.log('\nClient: "' + clientList[i].clientId + '" connection closed')
            }
        }
        printTickets()
    })
})

function selfAssignment(message,ws) {
    for(var i = 0; i < ticketList.length; i++) {
        if(ticketList[i].ticketId === message) {
            ticketList[i].ticketTaken = true
            for(var k = 0; k < clientList.length; k++) {
                if(clientList[k].connection === ws) {
                    ticketList[i].clientId = clientList[k].clientId
                }
            }
        }
    }
    printTickets()
}

function sendTicketList(){
    let myJson = JSON.stringify(ticketList)

    for(var i=0; i < clientList.length; i++) {
        clientList[i].connection.send(myJson)
    }
}

function inputServer() {
    rl.question("", function(input){
        if(input == "n") {
            var temp = new ticket((ticketList.length + 1), false, "")
            ticketList.push(temp)
            printTickets()
            sendTicketList()
            inputServer()
        } else if(input == "q") {
            console.log("\nServer closed...")
            process.exit(0)
        }
    })
}

function printTickets(){
    if(ticketList.length == 0) {
        console.log('\nNo Tickets\nn: new ticket, q: quit')
    } else {
        console.log('\nTickets:')
        for(var i = 0; i < ticketList.length; i++) {
            if(ticketList[i].ticketTaken == true) {
                console.log('ticket' + ticketList[i].ticketId + ' (' + ticketList[i].clientId + ')')
            } else {
                console.log('ticket' + ticketList[i].ticketId + ' (not assigned yet)')
            }
        }
        console.log('n: new ticket, q: quit')
    }
}