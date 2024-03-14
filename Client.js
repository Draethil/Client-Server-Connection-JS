const WebSocket = require('ws')
const url = 'ws://localhost:9000'
const connection = new WebSocket(url)

const readline = require("readline")
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

let ticketList = []

connection.onopen = () => {
    console.log('Client started...')
    rl.question('Please enter Client-ID: ', function(clientid ){
        connection.send(JSON.stringify(clientid))
        inputClient()
    })
}

connection.onerror = (error) => {
    console.log(`WebSocket error: ${error}`)
}

connection.onmessage = (e) => {
    ticketList = JSON.parse(e.data)
    printTickets()
}

function inputClient(){
    rl.question("", function(input){
        if(input == "q") {
            console.log('\nClient closed...')
            process.exit(0)
        } else if(input > 0 && input <= ticketList.length) {
            connection.send(JSON.stringify(parseInt(input)))
        }
        inputClient()
    })
}

function printTickets(){
    if(ticketList.length == 0) {
        console.log('\nNo Tickets\nnumber: self assignment, q: quit')
    } else {
        console.log('\nTickets:')
        for(var i = 0; i < ticketList.length; i++) {
            if(ticketList[i].ticketTaken == true) {
                console.log('ticket' + ticketList[i].ticketId + ' (' + ticketList[i].clientId + ')')
            } else {
                console.log('ticket' + ticketList[i].ticketId + ' (not assigned yet)')
            }
        }
        console.log('number: self assignment, q: quit')
    }
}