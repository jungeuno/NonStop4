window.TrackJS &&
    TrackJS.install({
    token: "ee6fab19c5a04ac1a32a645abde4613a",
    application: "black-dashboard-free"
});
function saveUserInfo(){
    //save user-id 
}

const baseURL=window.location.origin;

async function login(){
    const requestURI = `/login`;
    const url = baseURL + requestURI;
    alert(url);
    try{
        const response=await fetch(url,{
            method: 'POST',
            redirect: 'error'
        });
    } catch(error) {
        console.log(`login 요청 과정에서 error 발생 :\n${error}`);
    }
}

$(document).ready(function() {
    $().ready(function() {
        const loginButton=document.querySelector("#login-button")
        loginButton.addEventListener("click",login);

    });
});