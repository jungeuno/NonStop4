from oauth2client.contrib.flask_util import UserOAuth2
from flask import Flask, render_template, request, session, redirect, url_for, jsonify, make_response
import subprocess
import os
import zipfile
import json
import paramiko # pip install paramiko
import datetime as dt
import signal   # For timeout
import time     # For timeout

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False
# 현재 경로
BASE_DIR = os.getcwd()

# 구글 로그인 API 클라이언트 ID & PASSWORD
app.config['SECRET_KEY'] = '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'
app.config['GOOGLE_OAUTH2_CLIENT_SECRETS_FILE'] = 'client_secret_9542596386-2kkmu7fkdv00p6pomousdniphu0job4i.apps.googleusercontent.com.json'

oauth2 = UserOAuth2(app)

# 현재 날짜/시간 기록 변수 - today_date
now = dt.datetime.now()
today_date = now.strftime('%Y - %m - %d    |    %H : %M : %S')

# JSON 파일 경로
data_file_path = 'data.json'
# JSON 파일을 읽어서 데이터를 저장할 딕셔너리 생성
user_data = {}
if os.path.exists(data_file_path):
    with open(data_file_path, 'r', encoding='utf-8') as fp:
        user_data = json.load(fp)

# 'user.json'JSON 파일 경로
user_file_path = 'user.json'
# JSON 파일을 읽어서 데이터를 저장할 딕셔너리 생성
user_list = {}
if os.path.exists(user_file_path):
    with open(user_file_path, 'r', encoding='utf-8') as fp:
        user_list = json.load(fp)
######################################################################################################################################
# route 설정 & 페이지 렌더링
@app.route('/')
def login_page():
    return render_template('login.html')

@app.route('/main.html')
def main_page():
    return render_template('main.html')

@app.route('/containerList.html')
def containerList_page():
    if oauth2.has_credentials():
        return render_template('containerList.html', useremail=oauth2.email)
    
@app.route('/editDeploy.html')
def editDeploy_page():
    if oauth2.has_credentials():
        return render_template('editDeploy.html')

@app.route('/containerDash.html')
def containerDash_page():
    if oauth2.has_credentials():
        return render_template('containerDash.html')

@app.route('/deploy.html')
def deploy_page():
    if oauth2.has_credentials():
        return render_template('deploy.html', useremail=oauth2.email)

# 로그인
@app.route('/login', methods=['GET', 'POST'])
@oauth2.required
def login():
    oauth = oauth2.http()
    credentials = oauth2.credentials
    # 로그인 계정의 이메일과 사용자 id를 받아옴
    # user_list에 사용자 이메일이 없다면 JSON 파일에 가입 일자 등록 
    if oauth2.email not in user_list:
        registerationDate = today_date
        user_list[oauth2.email] = [{
            "Registeration Date": registerationDate }]
        with open(user_file_path, 'w', encoding='utf-8') as fp:
            json.dump(user_list, fp, sort_keys=True, indent=4, ensure_ascii=False)

    return render_template('containerList.html', useremail=oauth2.email)
######################################################################################################################################
# 로그아웃
@app.route('/logout', methods=['POST', 'GET'])
def logout():
    session.clear()
    return ('', 204)
######################################################################################################################################
# 마이페이지
@app.route('/mypage.html')
def my_page():
    if oauth2.has_credentials():
        user_email = oauth2.email               # 사용자 이메일
        user_date = user_list.get(user_email)   # 사용자 데이터 가져오기
        user_registeration = user_date[0]["Registeration Date"]

        if user_email is None or user_data is None:
            return "User not found"
        return render_template('mypage.html', useremail=user_email, userDate=user_registeration)
######################################################################################################################################
# 회원탈퇴 - 로그아웃 & data.json/user.json 에서 데이터 삭제
@app.route('/withdrawal', methods=['POST', 'GET'])
def withdrawal():
    user_email = oauth2.email               # 사용자 이메일

    # 파일에서 데이터 불러오기
    with open(data_file_path, 'r', encoding='utf-8') as fp:
        user_data = json.load(fp)  # user_data 불러오기
    with open(user_file_path, 'r', encoding='utf-8') as fp:
        user_list = json.load(fp)  # user_list 불러오기

    # 키가 존재하면 삭제
    if user_email in user_data:
        del user_data[user_email]
    if user_email in user_list:
        del user_list[user_email]

    # JSON 파일에 데이터를 저장 (ensure_ascii 옵션을 False로 설정하여 한글이 유니코드로 저장되도록 함)
    with open(data_file_path, 'w', encoding='utf-8') as fp:
        json.dump(user_data, fp, sort_keys=True, indent=4, ensure_ascii=False)
    with open(user_file_path, 'w', encoding='utf-8') as fp:
        json.dump(user_list, fp, sort_keys=True, indent=4, ensure_ascii=False)

    session.clear()
    return ('', 204)
######################################################################################################################################
# 사용자별 배포 목록
# 사용자 이름과 배포명 추가 -> json 파일로 저장
# 사용자 이름 해당하면 배포명 (리스트) json dump 반환
# deploy.html 에서 배포하기 버튼 클릭 시, append 되어야 함. -> deployList() 함수 실행돼야 함.
# json.dump 파일 프론트로 렌더링 되는지 확인 -> 상태 값은 모니터링 때, 받아올 수 있음 / 개발 환경은 프론트 체크 박스에서 받아와야 함. 
# /services 경로에 대한 엔드포인트 함수
@app.route('/services', methods=['POST', 'GET'])
def containerDeploy_page():
    user_email = oauth2.email                            # 현재 로그인된 사용자 이메일
    if request.method == 'POST':
        file = request.files['uploadFile_name']          # 업로드되는 파일 받기
        program_name = request.form['service_name']      # 사용자가 배포하는 프로그램명 받기
        front_env = request.form.getlist('frontEnv')     # 선택된 개발 환경 리스트 받기
        db_env = request.form.getlist('dbEnv')           # 선택된 개발 환경 리스트 받기
        back_env = request.form.getlist('backEnv')       # 선택된 개발 환경 리스트 받기
        file_name = file.name

        user_name = ""              # 사용자 명 파싱하기 - 이메일 값에서 특수문자 제외
        user_name = user_email.replace('@', '').replace('.', '')
        namespace = user_name+'-'+program_name

        # json 데이터 초기화 & data.json 파일에 데이터 저장 ------------------------------------------------------------------------------------------------------
        containers = []
        envx = [0]*19
        front = {}
        back = {}
        db = {}
        frontStatus = []
        backStatuse = []
        dbStatus = []

        # 'name'
        if front_env!=[]:
                front['name'] = program_name+'_Front'
        if db_env!=[]:
                db['name'] = program_name+'_Db'
        if back_env!=[]:
                back['name'] = program_name+'_Back'
        # 'env' (개발환경) 설정
        for fe in front_env:
            fe = int(fe)
            envx[fe] = 1
        for de in db_env:
            de = int(de)    
            envx[de] = 1
        for be in back_env:
            be = int(be)        
            envx[be] = 1
        print('envx', envx)

        # json 파일의 containers 객체 설정
        if front_env!=[]:
            front['env'] = front_env
            containers.append(front)
        if back_env!=[]:
            back['env'] = back_env
            containers.append(back)
        if db_env!=[]:
            db['env'] = db_env
            containers.append(db)

        # 소스코드 unzip 하고 저장하기 ------------------------------------------------------------------------------------------------------
        # BASE 경로 -> {현재 실행되는 path}/userSource/{user_email}
        folder_path = os.path.join(BASE_DIR, 'test_upload', user_name)
        os.makedirs(folder_path, exist_ok=True)
        
        # 저장할 파일의 경로 설정 -> 위의 BASE 경로에서 사용자 별로 배포한 프로그램명 단위로 파일 저장 -> {현재 실행되는 path}/userSource/{user_email}/{program_name}/{본래의 폴더명}
        file_path = os.path.join(folder_path, program_name+'.zip')
        file.save(file_path)
        
        # 만약 업로드한 파일이 .zip 파일이라면 unzip 수행
        if file_path.endswith('.zip'):
            unzip_folder_path = os.path.splitext(file_path)[0]  # .zip 확장자 제외한 경로
            with zipfile.ZipFile(file_path, 'r') as zip_ref:
                zip_ref.extractall(unzip_folder_path)
            # 체크한 개발 환경 기반으로 env_txt 파일 생성
            env_txt = ''
            for e in envx:
                env_txt += str(e)
            # 체크한 개발 환경 기반으로 env_txt 파일 저장
            env_txt_file_path = os.path.join(unzip_folder_path, program_name,'env.txt')
            with open(env_txt_file_path, 'w') as f:
                f.write(env_txt)
            # username.txt 파일 생성 및 저장
            username_txt_file_path = os.path.join(os.path.join(BASE_DIR, 'test_upload'), 'username.txt')
            with open(username_txt_file_path, 'w', encoding='utf-8') as f:
                f.write(namespace)
            os.remove(file_path)  # .zip 파일 삭제
                    
            # GitHub에 업로드
            upload_to_github(os.path.join(BASE_DIR, 'test_upload'))
        else:
            return '.zip 파일을 업로드 해주세요.'

        # IP 생성까지 반복 호출 -----------------------------------------------------------------------------
        while True:     # 무한 반복이므로 배포 실패했을 경우, 타임아웃을 걸어서 Fail 반환하도록
            if returnServicetIP(namespace) != '' and returnServicetIP(namespace) != "<pending>":
                print('returnServicetIP(namespace) is not \'\' : ', returnServicetIP(namespace))
                break
            else:
                print('returnServicetIP(namespace) is \'\' : ', returnServicetIP(namespace))
                # break

        # 프론트/백/DB -> json 파일에 서비스명 + 컨테이너명(서비스명_Front/서비스면_Back/서비스명_DB) 설정
        # 'state' 컨테이너 status 값 파싱 & JSON 파일에 저장
        result_dict = getContainerStatus(namespace)     # 컨테이너 상태값(status) 확인
        getServiceIP = returnServicetIP(namespace)      # 배포된 IP 가져오기
        for dict_name in result_dict:
            if 'frontend-deployment' in dict_name:
                frontStatus.append(result_dict[dict_name])
            elif 'backend-deployment' in dict_name:
                backStatuse.append(result_dict[dict_name])
            elif 'db-deployment' in dict_name:
                dbStatus.append(result_dict[dict_name])
        front['state'] = frontStatus
        back['state'] = backStatuse
        db['state'] = dbStatus

        # 사용자 이메일을 기준으로 데이터가 있는지 확인하고 데이터 추가 또는 새로운 사용자 JSON 객체 생성
        if oauth2.email in user_data:
            user_data[oauth2.email].append({
                'Service Name': program_name,
                'Containers' : containers,
                'Creating Date' : today_date,
                'Service IP' : getServiceIP
            })
        else:
            user_data[oauth2.email] = [{
                'Service Name': program_name,
                'Containers' : containers,
                'Creating Date' : today_date,
                'Service IP' : getServiceIP
            }]

        # JSON 파일에 데이터를 저장 (ensure_ascii 옵션을 False로 설정하여 한글이 유니코드로 저장되도록 함)
        with open(data_file_path, 'w', encoding='utf-8') as fp:
            json.dump(user_data, fp, sort_keys=True, indent=4, ensure_ascii=False)

        return render_template('containerList.html')
      
    elif request.method == 'GET':
        return json.dumps({oauth2.email: user_data[oauth2.email]}, ensure_ascii=False)
    return 'Fail'
######################################################################################################################################
# 업데이트 & 수정
# @app.route('/editDeploy.html')
@app.route('/services/<string:service_name>', methods=['UPDATE'])
def containerEditDeploy_page(service_name):
    user_email = oauth2.email                            # 현재 로그인된 사용자 이메일
    if request.method == 'UPDATE':
        file = request.files['uploadFile_name']          # 업로드되는 파일 받기
        program_name = service_name                      # 사용자가 배포하는 프로그램명 받기

        user_name = ""              # 사용자 명 파싱하기 - 이메일 값에서 특수문자 제외
        user_name = user_email.replace('@', '').replace('.', '')
        namespace = user_name+'-'+program_name

        # IP 생성되면 JSON 파일에 데이터 저장하기    
        # 해당 사용자의 컨테이너 리스트 데이터 가져오기 ------------------------------------------------------------------------------------------------------
        getUserData = user_data[oauth2.email]
        # 컨테이너 status 값 파싱
        result_dict = getContainerStatus(namespace)
        print(result_dict.items())
        envxa = [0]*19
        frontStatus = []
        backStatuse = []
        dbStatus = []
        for container_name in result_dict.keys():
            if 'frontend-deployment' in container_name:
                frontStatus.append(result_dict[container_name])
            elif 'backend-deployment' in container_name:
                backStatuse.append(result_dict[container_name])
            elif 'db-deployment' in container_name:
                dbStatus.append(result_dict[container_name])
        for element in getUserData:
            if element["Service Name"] == service_name:
                element["Update"] = today_date
                for container_name in result_dict:
                    if 'frontend-deployment' in container_name:
                        element['Containers'][0]['state'] = frontStatus
                        front_enva = element['Containers'][0]['env']
                    elif 'backend-deployment' in container_name:
                        element['Containers'][1]['state'] = backStatuse
                        back_enva = element['Containers'][0]['env']
                    elif 'db-deployment' in container_name:
                        element['Containers'][2]['state'] = dbStatus
                        db_enva = element['Containers'][0]['env']
        for fe in front_enva:
            fe = int(fe)
            envxa[fe] = 1
        for de in db_enva:
            de = int(de)    
            envxa[de] = 1
        for be in back_enva:
            be = int(be)        
            envxa[be] = 1
        print('envxa', envxa)

        # 소스코드 unzip 하고 저장하기 ------------------------------------------------------------------------------------------------------
        user_name = ""              # 사용자 명 파싱하기 - 이메일 값에서 특수문자 제외
        user_name = user_email.replace('@', '').replace('.', '')

        # BASE 경로 -> {현재 실행되는 path}/userSource/{user_email}
        folder_path = os.path.join(BASE_DIR, 'test_upload', user_name)
        os.makedirs(folder_path, exist_ok=True)
        
        # 저장할 파일의 경로 설정 -> 위의 BASE 경로에서 사용자 별로 배포한 프로그램명 단위로 파일 저장 -> {현재 실행되는 path}/userSource/{user_email}/{program_name}/{본래의 폴더명}
        file_path = os.path.join(folder_path, program_name+'.zip')
        file.save(file_path)
        
        # 만약 업로드한 파일이 .zip 파일이라면 unzip 수행
        if file_path.endswith('.zip'):
            unzip_folder_path = os.path.splitext(file_path)[0]  # .zip 확장자 제외한 경로
            with zipfile.ZipFile(file_path, 'r') as zip_ref:
                zip_ref.extractall(unzip_folder_path)
            # 체크한 개발 환경 기반으로 env_txt 파일 생성
            env_txt = ''
            for e in envxa:
                env_txt += str(e)
            # 체크한 개발 환경 기반으로 env_txt 파일 저장
            env_txt_file_path = os.path.join(unzip_folder_path, program_name,'env.txt')
            with open(env_txt_file_path, 'w') as f:
                f.write(env_txt)
            # username.txt 파일 생성 및 저장
            username_txt_file_path = os.path.join(os.path.join(BASE_DIR, 'test_upload'), 'username.txt')
            with open(username_txt_file_path, 'w', encoding='utf-8') as f:
                f.write(namespace)
            os.remove(file_path)  # .zip 파일 삭제
            # GitHub에 업로드
            upload_to_github(os.path.join(BASE_DIR, 'test_upload'))
        else:
            return '.zip 파일을 업로드 해주세요.'

        # IP 생성까지 반복 호출 -----------------------------------------------------------------------------
        while True:     # 무한 반복이므로 배포 실패했을 경우, 타임아웃을 걸어서 Fail 반환하도록
            if returnServicetIP(namespace) != '' and returnServicetIP(namespace) != "<pending>":
                print('returnServicetIP(namespace) is not \'\' : ', returnServicetIP(namespace))
                break
            else:
                print('returnServicetIP(namespace) is \'\' : ', returnServicetIP(namespace))
                # break

        getIP = returnServicetIP(namespace)
        # returnServiceIP() 반환값 ip를 data.json 에 추가하기
        for element in getUserData:
            if element["Service Name"] == service_name:
                element["Service IP"] = getIP

        # JSON 파일에 데이터를 저장 (ensure_ascii 옵션을 False로 설정하여 한글이 유니코드로 저장되도록 함)
        with open(data_file_path, 'w', encoding='utf-8') as fp:
            json.dump(user_data, fp, sort_keys=True, indent=4, ensure_ascii=False)

        return make_response('', 204)
    
    elif request.method == 'GET':
        return json.dumps({oauth2.email: user_data[oauth2.email]}, ensure_ascii=False)
#####################################################################################################################################
# 컨테이너 제어 작업 / pip install paramiko
# run / pause / refresh  동작 버튼 
# run : POST /services/{service-name}/containers/{container-name} + 'body에 run 문자열"
# pause : POST /services/{service-name}/containers/{container-name} + 'body에 pause 문자열"
# refresh : GET /services/{service-name}/containers/{container-name} 
@app.route('/services/<string:service_name>/containers/<string:container_service_name>', methods=['POST', 'GET'])
def returnContainerStatus(service_name, container_service_name): #test #test_Front #run
    user_email = oauth2.email
    program_name = service_name
    
    user_name = ""              # 사용자 명 파싱하기 - 이메일 값에서 특수문자 제외
    user_name = user_email.replace('@', '').replace('.', '')
    namespace = user_name+'-'+program_name
    setUser = 'opc'          

    # 마스터노드 접속
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('150.136.87.94', port = '22', username = setUser, key_filename = './master-06-26.key')

    locate = '' # frontend / backend / db

    if container_service_name.endswith("_Front"):
        locate = 'frontend'
    elif container_service_name.endswith("_Back"):
        locate = 'backend'
    elif container_service_name.endswith("_Db"):
        locate = 'db'

    getUserData = user_data[user_email]
    # 컨테이너 status 값 파싱 - ssh
    result_dict = getContainerStatus(namespace)
    print(result_dict.items())
    currentStatus = []

    # 'run' / 'pause' 버튼 동작 --------------------------------------------------------------------------------
    if request.method == 'POST':  # run /pause
        getButton = request.get_json()
        button = getButton['work']

        if button == 'run':
            scale = '2'
            if locate == 'db':
                scale = '1'
        elif button == 'pause':
            scale = '0'
        else:
            ssh.close()
            return 'Error : cannot find button'
        # ssh 명령어 실행
        ssh.exec_command('kubectl scale deployment ' + locate +'-deployment --replicas='+ scale +' -n '+ namespace) # kubectl scale deployment front-deployment --replocas -n {$namespace}
        
        result_dict = getContainerStatus(namespace)

        ssh.close()
        return make_response('', 204)
    
    # 'refresh' 버튼 동작 --------------------------------------------------------------------------------------
    elif request.method == 'GET':  
        # status 리스트에서 'frontend' 있으면, currentStatus 배열에 status 값 저장
        for getNameKey in result_dict.keys():
            if locate in getNameKey:
                getStatus = result_dict.get(getNameKey)
                currentStatus.append(getStatus)
        # currentStatus 배열 JSON 파일에 갱신
        for gud in getUserData:
            if gud['Service Name'] == program_name:
                if container_service_name.endswith("_Front"):
                    gud['Containers'][0]['state'] = currentStatus
                elif container_service_name.endswith("_Back"):
                    gud['Containers'][1]['state'] = currentStatus
                elif container_service_name.endswith("_Db"):
                    gud['Containers'][2]['state'] = currentStatus
        # getIP
        for gud in getUserData:
            if gud['Service Name'] == program_name:
                gud['Service IP'] = returnServicetIP(namespace)
    
        # JSON 파일에 데이터를 저장 (ensure_ascii 옵션을 False로 설정하여 한글이 유니코드로 저장되도록 함)
        with open(data_file_path, 'w', encoding='utf-8') as fp:
            json.dump(user_data, fp, sort_keys=True, indent=4, ensure_ascii=False)
        
        print('Refresh currentStatus', currentStatus)
        ssh.close()

        return json.dumps({"state" : currentStatus}, ensure_ascii=False)
        # 해당 서비스 컨테이너의 Status List 값만 반환 (ex. ['Running', 'Running'])
    
    return currentStatus # 해당 서비스 컨테이너의 Status List 값만 반환 (ex. ['Running', 'Running'])
######################################################################################################################################
# kubectl delete namespace <$usrname>
# delete : DELETE /services/{service-name}
@app.route('/services/<string:service_name>', methods=['DELETE'])
def deleteService(service_name): #test #test_Front #run
    user_email = oauth2.email
    program_name = service_name
    
    user_name = ""              # 사용자 명 파싱하기 - 이메일 값에서 특수문자 제외
    user_name = user_email.replace('@', '').replace('.', '')
    namespace = user_name+'-'+program_name
    setUser = 'opc'  

    # 마스터노드 접속
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('150.136.87.94', port = '22', username = setUser, key_filename = './master-06-26.key')
    # 'delete' 동작 명령어 실행 ---------------------------------------------------------------------------------------
    # delete 명령어 실행 후, json 파일에서 삭제함.
    ssh.exec_command('kubectl delete namespace ' + namespace)
    ssh.exec_command('kubectl delete pv '  + namespace + '-pv')
    ssh.close()

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('129.213.121.220', port = '22', username = setUser, key_filename = './master-06-26.key')
    ssh.exec_command('sudo rm -r /nfs-share/' + namespace)
    ssh.close()

    # service-name 과 서비스명 같은 것 비교해서 JSON 파일에서 삭제
    for email, data_list in user_data.items():
        new_data_list = []
        for element in data_list:
            if element['Service Name'] != program_name:
                new_data_list.append(element)
        user_data[email] = new_data_list
        print(new_data_list)
        
    # JSON 파일에 데이터를 저장 (ensure_ascii 옵션을 False로 설정하여 한글이 유니코드로 저장되도록 함)
    with open(data_file_path, 'w', encoding='utf-8') as fp:
        json.dump(user_data, fp, sort_keys=True, indent=4, ensure_ascii=False)
    
    #print('After Delete : ', getContainerStatus(namespace))
    print('return JSON Dumps : ', json.dumps({oauth2.email: user_data[oauth2.email]}, ensure_ascii=False))
    #ssh.close()
    return json.dumps({oauth2.email: user_data[oauth2.email]}, ensure_ascii=False)
######################################################################################################################################
# pod name 반환
@app.route('/services/<string:service_name>/containers/<string:container_name>/pods', methods=['GET'])
def returnPodName(service_name, container_name):
    user_email = oauth2.email
    program_name = service_name
    
    podName = []
    user_name = ""              # 사용자 명 파싱하기 - 이메일 값에서 특수문자 제외
    user_name = user_email.replace('@', '').replace('.', '')
    namespace = user_name+'-'+program_name
    
    getPodList = getContainerStatus(namespace)
    if container_name.endswith("_Front"):
        for name in getPodList.keys():
            if 'frontend' in name:
                podName.append(name)
    elif container_name.endswith("_Back"):
        for name in getPodList.keys():
            if 'backend' in name:
                podName.append(name)
    elif container_name.endswith("_DB"):
        for name in getPodList.keys():
            if 'db' in name:
                podName.append(name)
    print('podName', podName)
    return json.dumps({"podNames": podName}, ensure_ascii=False) # NAME : STATUS 파싱한 딕셔너리 반환
######################################################################################################################################
# Kubectl get svc -n namespace -------------------------------------------------------------------------------------------------------
# 배포 결과 - 서비스 IP 가져와서 프론트로 반환  
def returnServicetIP(namespace):
    setUser = 'opc'          
    getIP = ''

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('150.136.87.94', port = '22', username = setUser, key_filename = './master-06-26.key')

    stdin, stdout, stderr = ssh.exec_command('kubectl get svc -n '+ namespace) # kubectl get deployment -n {$namespace}
    output_lines = stdout.readlines()  
    
    result = "".join(output_lines)
    print("=== Output ===")
    print(result)
    print("==============")

    # 첫 번째 줄은 헤더이므로 무시하고, 두 번째 줄부터 파싱 시작
    for line in output_lines[1:]:
        line = line.strip()  # 줄바꿈 문자 제거
        if not line:
            continue  # 빈 줄은 무시

        # 줄을 공백으로 분리하여 name과 status 정보 추출
        columns = line.split()
        if 'front' in columns[0]: 
            getIP = columns[3]
            break
    # 딕셔너리에 name을 키로, status를 값으로 저장
    ssh.close()
    return getIP # NAME : STATUS 파싱한 딕셔너리 반환
######################################################################################################################################
# 컨테이너 status 확인 (Running/Stop/Pending/error 등) / pip install paramiko
def getContainerStatus(namespace):
    setUser = 'opc'          

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('150.136.87.94', port = '22', username = setUser, key_filename = './master-06-26.key')

    stdin, stdout, stderr = ssh.exec_command('kubectl get pod -n '+ namespace) # kubectl get deployment -n {$namespace}
    output_lines = stdout.readlines()  
    
    result = "".join(output_lines)
    print("=== Output ===")
    print(result)
    print("==============")

    deployment_info = {}  # 딕셔너리로 저장할 변수

    # 첫 번째 줄은 헤더이므로 무시하고, 두 번째 줄부터 파싱 시작
    for line in output_lines[1:]:
        line = line.strip()  # 줄바꿈 문자 제거
        if not line:
            continue  # 빈 줄은 무시

        # 줄을 공백으로 분리하여 name과 status 정보 추출
        columns = line.split()
        name = columns[0]
        status = columns[2]

        # 딕셔너리에 name을 키로, status를 값으로 저장
        deployment_info[name] = status

    ssh.close()

    return deployment_info # NAME : STATUS 파싱한 딕셔너리 반환
######################################################################################################################################
# 파일 업로드 & Git Push 자동화
# 해당 폴더에서 미리 userSource 폴더 안에서 [1. git init] [2. git remote add origin <깃허브주소링크>] 셋팅해주어야 함.
# 폴더 경로 -> userSource/{user_email}/{program_name}/{unzip_files}
# teamnonstop github 엑세스 토큰 - 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
def upload_to_github(local_path):
    try:
        # Git 초기화
        #subprocess.call(['git', 'init'], cwd=local_path, shell=True)

        # git pull 먼저 실행
        subprocess.call(['git', 'pull'], cwd=local_path, shell=True)

        # 모든 파일을 스테이징
        subprocess.call(['git', 'add', '.'], cwd=local_path, shell=True)

        # 커밋 메시지 작성
        commit_message = 'File upload'
        subprocess.call(['git', 'commit', '-m', commit_message], cwd=local_path, shell=True)

        # GitHub 원격 저장소로 푸시 / origin master 브랜치로 생성해야 push 됨 // 리포지토리 수정 필요!!!!!!!!!!!!!!!
        subprocess.call(['git', 'push'], cwd=local_path, shell=True)
#, 'https://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@github.com/teamnonstop/test_upload.git'
    except subprocess.CalledProcessError as e:
        print(f"Error occurred during Git commands: {e}")
        # 예외 처리
######################################################################################################################################
#start_test
if __name__ == '__main__':
    app.run(port="8080", debug=True)