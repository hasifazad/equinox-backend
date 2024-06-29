

function express(num, text) {



    return {
        name: 'john',
        age: 23,
        hello: function () {
            console.log('execuedd the function');
        }
    }

}

let app = express(23, 'abc')

console.log(app);

app.hello()


let busiines =  [
    {
        bussiness_id: 'asdsa',
        bussines_name: 'asdsa'
    }
]

console.log(busiines[0].bussines_name);