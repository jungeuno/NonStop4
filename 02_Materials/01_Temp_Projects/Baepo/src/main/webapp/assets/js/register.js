window.TrackJS &&TrackJS.install({
    token: "ee6fab19c5a04ac1a32a645abde4613a",
    application: "black-dashboard-free"
});

const baseURL=window.location.origin;

async function register(){
    console.log("register func starts...");
    const requestURI = `/register`;
    const url = baseURL + requestURI;
    try{
        const response=await fetch(url,{
            method: 'POST',
            redirect: 'error'
        });
    } catch(error) {
        console.log(`register 요청 과정에서 error 발생 :\n${error}`);
    }
}

$(document).ready(function() {
    $().ready(function() {
        const registerButton=document.querySelector("#register-button");
        registerButton.addEventListener("click",register);
    });
});