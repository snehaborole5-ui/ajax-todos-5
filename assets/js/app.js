const cl = console.log;
const inputform = document.getElementById('inputform')
const title = document.getElementById('title')
const UserId = document.getElementById('UserId')
const status = document.getElementById('status')
const Addtodo = document.getElementById('Addtodo')
const Updatetodo = document.getElementById('Updatetodo')
const todocontainer = document.getElementById('todocontainer')
const spinner = document.getElementById('spinner')



let Base_Url =`https://jsonplaceholder.typicode.com/todos`

let todoArr = []



function snackbar(msg,icon){
    swal.fire({
        title : msg,
        icon : icon,
        timer : 3000
    })
}

function fetchtodo(){
    spinner.classList.remove('d-none')
    let xhr = new XMLHttpRequest()

    xhr.open('GET',Base_Url)

    xhr.send(null)
    xhr.onload = function (){
        if(xhr.status >= 200 && xhr.status <= 299){
            todoArr = JSON.parse(xhr.response)

            createTodo(todoArr.reverse())

        }
        spinner.classList.add('d-none')

    }
}

fetchtodo()

function seticons(status){
    if(status.toString() == "true"){
        return `<i class="fa-solid fa-square-check fa-2x text-warning"></i>`
    }else{
        return `<i class="fa-solid fa-square-xmark fa-2x text-danger"></i>`
    }
}





function createTodo(arr){
    let result = ``

    arr.forEach((ele,i) =>{
        result+=`<tr id=${ele.id}>
					<td>${arr.length - i}</td>
					<td>${ele.title}</td>
					<td>${seticons(ele.completed)}</td>
					<td><i role='button' class="fa-regular fa-pen-to-square fa-2x text-warning" onclick='Onedit(this)'></i></td>
					<td><i role='button' class="fa-solid fa-trash fa-2x text-danger" onclick='OnRemove(this)'></i></td>
				</tr>`
    })

    todocontainer.innerHTML = result


}


function onsubmit(ele){
    spinner.classList.remove('d-none')

    ele.preventDefault()

    let newtodo ={
        userId : UserId.value,
        title : title.value,
        completed : status.value
    }

    todoArr.unshift(newtodo)

    let xhr = new XMLHttpRequest()

    xhr.open('POST',Base_Url)

    xhr.send(JSON.stringify(newtodo))

    xhr.onload = function (){
        if(xhr.status >= 200 && xhr.status <= 299){
            let res = JSON.parse(xhr.response)

            createNewtodo(newtodo,res)

            snackbar(`The new todo id ${res.id} is Added Successfully!!`,'success')
        }
        spinner.classList.add('d-none')

    }



}


function createNewtodo(newtodo,res){
    let tr = document.createElement('tr')

    tr.id = res.id

    tr.innerHTML =`<td>${todoArr.length}</td>
					<td>${newtodo.title}</td>
					<td>${seticons(newtodo.completed)}</td>
					<td><i role='button' class="fa-regular fa-pen-to-square fa-2x text-success" onclick='Onedit(this)'></i></td>
					<td><i role='button' class="fa-solid fa-trash fa-2x text-danger" onclick='OnRemove(this)'></i></td>
				`

    todocontainer.prepend(tr)
    inputform.reset()



}


function Onedit(ele){
    spinner.classList.remove('d-none')

    let editId = ele.closest('tr').id
    localStorage.setItem('EditId',editId)

    let editUrl = `${Base_Url}/${editId}`

    let xhr = new XMLHttpRequest()

    xhr.open('GET',editUrl)

    xhr.send(null)

    xhr.onload = function(){
        if(xhr.status >= 200 && xhr.status <= 299){
            let editobj = JSON.parse(xhr.response)

            title.value = editobj.title
            UserId.value = editobj.userId
            status.value = editobj.completed



            Addtodo.classList.add('d-none')
            Updatetodo.classList.remove('d-none')
        }

        spinner.classList.add('d-none')

    }


}

function onupdate(){
    spinner.classList.remove('d-none')

    let updateId = localStorage.getItem('EditId')

    let updateobj ={
        userId : UserId.value,
        title : title.value,
        completed : status.value,
        id : updateId
    }

    let updateUrl =`${Base_Url}/${updateId}`

    let xhr = new XMLHttpRequest()

    xhr.open('PUT',updateUrl)
    
    xhr.send(JSON.stringify(updateobj))

    xhr.onload = function(){
        if(xhr.status >= 200 && xhr.status <= 299){
            let tr = document.getElementById(updateId).children

            tr[1].innerText = updateobj.title
            tr[2].innerHTML =` ${seticons(updateobj.completed)}`

            Addtodo.classList.remove('d-none')
            Updatetodo.classList.add('d-none')

            inputform.reset()
            snackbar(`The todo id ${updateId} is Updated Successfully!!`,'success')

        }


        spinner.classList.add('d-none')

    }


}

function OnRemove(ele){

    let removeId = ele.closest('tr').id
    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
        }).then((result) => {
        if (result.isConfirmed) {
            spinner.classList.remove('d-none')
            
            let removeUrl = `${Base_Url}/${removeId}`

            let xhr = new XMLHttpRequest()
            xhr.open('DELETE',removeUrl)

            xhr.send()

            xhr.onload = function(){
                if(xhr.status >= 200 && xhr.status <= 299){
                    ele.closest('tr').remove()
                    snackbar(`The todo id ${removeId} is Removed Successfully!!`,'success')

                }

                spinner.classList.add('d-none')
            
                
            }
            
            spinner.classList.add('d-none')



        }
    });

}





inputform.addEventListener('submit',onsubmit)
Updatetodo.addEventListener('click',onupdate)