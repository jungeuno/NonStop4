window.TrackJS &&
    TrackJS.install({
    token: "ee6fab19c5a04ac1a32a645abde4613a",
    application: "black-dashboard-free"
});

function getServiceList(){

}
function getContainerList(){

}

$(document).ready(function() {
    $().ready(function() {

        $sidebar = $(".sidebar");
        $navbar = $(".navbar");
        $main_panel = $(".main-panel");
        $full_page = $(".full-page");
        $sidebar_responsive = $("body > .navbar-collapse");
        sidebar_mini_active = true;
        white_color = false;
        window_width = $(window).width();
        fixed_plugin_open = $(".sidebar .sidebar-wrapper .nav li.active a p").html(); //현재 서비스명

        $(".switch-sidebar-mini input").on(
            "switchChange.bootstrapSwitch",
            function () {
                console.log("event 발생");
                var $btn = $(this);

                if (sidebar_mini_active == true) {
                $("body").removeClass("sidebar-mini");
                sidebar_mini_active = false;
                blackDashboard.showSidebarMessage(
                    "Sidebar mini deactivated..."
                );
                } else {
                $("body").addClass("sidebar-mini");
                sidebar_mini_active = true;
                blackDashboard.showSidebarMessage("Sidebar mini activated...");
                }

                // we simulate the window Resize so the charts will get updated in realtime.
                var simulateWindowResize = setInterval(function () {
                    window.dispatchEvent(new Event("resize"));
                }, 180);

                // we stop the simulation of Window Resize after the animations are completed
                setTimeout(function () {
                    clearInterval(simulateWindowResize);
                }, 1000);
            }
        );

        $(".switch-change-color input").on(
        "switchChange.bootstrapSwitch",
        function () {
            var $btn = $(this);

            if (white_color == true) {
                $("body").addClass("change-background");
                setTimeout(function () {
                    $("body").removeClass("change-background");
                    $("body").removeClass("white-content");
                }, 900);
                white_color = false;
            } else {
                $("body").addClass("change-background");
                setTimeout(function () {
                    $("body").removeClass("change-background");
                    $("body").addClass("white-content");
                }, 900);
                white_color = true;
            }
        }
        );

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