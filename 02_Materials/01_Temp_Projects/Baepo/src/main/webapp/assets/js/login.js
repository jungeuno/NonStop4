window.TrackJS &&
    TrackJS.install({
    token: "ee6fab19c5a04ac1a32a645abde4613a",
    application: "black-dashboard-free"
});
function saveUserInfo(){
    //save user-id 
}

async function login(baseURL){
    console.log(`login func 진입`);
    const requestURI = `/login`;
    const url = baseURL + requestURI;
    alert(url);
    try{
        const response=await fetch(url,{
            method: 'GET',
            redirect: 'error'
        });
    } catch(error) {
        console.log(`login 함수에서 에러 발생 :\n${error}`);
    }
}

$(document).ready(function() {
    $().ready(function() {
        const baseURL = window.location.origin;
        const loginButton=document.querySelector("#login-button")
        loginButton.addEventListener("click",login);

    });
});