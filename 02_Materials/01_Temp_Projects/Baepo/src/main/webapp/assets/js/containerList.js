/* containerList.html의 동작 흐름
1. 페이지 불러오기 전에 서버에서 유저 id로 서비스 리스트 요청
    - request : GET /users/{user-id}/services
    - response : 특정 유저의 서비스 목록
        service-name
2. 위의 응답을 가지고 사이드 바 구성
    - 첫번째 서비스에 active상태 걸어주기
3. 사이드 바의 서비스 목록에서 active 서비스명을 가지고 서버에 컨테이너 리스트 요청
    - request : GET users/{user-id}/services/{service-id}/containers
    - response : 특정 서비스의 컨테이너 목록
        container-name, container-state, container-envs, container-id
4. 위의 응답을 가지고, 메인 화면 구성
    - container-name 박아주기
    - container-id 박아주기
    - conatainer-state에 따라서 색깔 구성 (run : green, stop : red)
    - run이면 run-button 비활성화, stop이면 stop버튼 비활성화
    - container-envs에 따라서 아이콘 넣어주기  ex) springboot, python, 등,,,
5. 기타 작업
    - 서비스 추가 버튼 
        -> 사용자로부터 새 서비스명 입력
        -> '생성하기'버튼 누르면
        -> '새 서비스명', '사용자id' 서버로 보내기
        -> 서버에서 데이터베이스에 추가하기
    - container monitoring button 
        -> button이 클릭된 container의 id를 추출
        -> containerDash.html로 이동 : container-id 담아서
    - container managing button 
        -> button이 클릭된 container의 id를 추출
        -> editDeploy.html로 이동 : container-id 담아서
    - container plus button 
        -> user-id, service-id 추출
        -> deploy.html로 이동 : user-id, service-id 담아서 
*/

window.TrackJS &&
    TrackJS.install({
    token: "ee6fab19c5a04ac1a32a645abde4613a",
    application: "black-dashboard-free"
});

a
async function getServiceList(url){
    let response=fetch(url,{
        method:"GET"
    });


}
function getContainerList(){

}

$(document).ready(function() {
    $().ready(function() {

        //for modal
        const openAddServiceModalBtn=document.getElementById("openAddServiceModalBtn");
        const addServiceBtn=document.getElementById("addServiceBtn");
        $('#newServiceModal').on('shown.bs.modal',function(){
            document.getElementById("newServiceName").focus();
        });
        openAddServiceModalBtn.addEventListener("click",()=>{
            $('#newServiceModal').modal('show');
        });
        addServiceBtn.addEventListener("click",()=>{ 
            //1. 새로운 서비스명 

        });

        const newContainerBtn=document.getElementById("newContainerBtn");
        newContainerBtn.addEventListener("click",function(){
            location.href="deploy.html";
        });

        const monitoringBtns=document.querySelectorAll(".monitoring-btn");
        for(let i=0;i<monitoringBtns.length;i++){
            const btn=monitoringBtns[i];
            btn.addEventListener("click",()=>{
                //사용자 id도 같이 보내줘야 한다.
                location.href="containerDash.html"
            });
        }

        const managingBtns=document.querySelectorAll(".managing-btn");
        for(let i=0;i<managingBtns.length;i++){
            const btn=managingBtns[i];
            btn.addEventListener("click",()=>{
                //사용자 id도 같이 보내줘야 한다.
                location.href="editDeploy.html";
            });
        }


    });
});