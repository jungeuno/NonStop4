from oauth2client.contrib.flask_util import UserOAuth2
from flask import Flask, render_template, request, session, redirect, url_for, jsonify
import subprocess
import os
import zipfile
import json
import paramiko # pip install paramiko
import datetime as dt

app = Flask(__name__)

# 현재 경로
BASE_DIR = os.getcwd()

# 구글 로그인 API 클라이언트 ID & PASSWORD
app.config['SECRET_KEY'] = 'AIzaSyCHUx1bpNdKFMJ_3lvwaCbw15PabF1JNpw'
app.config['GOOGLE_OAUTH2_CLIENT_SECRETS_FILE'] = 'client_secret_9542596386-2kkmu7fkdv00p6pomousdniphu0job4i.apps.googleusercontent.com.json'

oauth2 = UserOAuth2(app)

# 가입 날짜 기록 변수 - today_date
now = dt.datetime.now()
today_date = now.date()

# JSON 파일 경로
data_file_path = 'data.json'
# JSON 파일을 읽어서 데이터를 저장할 딕셔너리 생성
user_data = {}
if os.path.exists(data_file_path):
    with open(data_file_path, 'r', encoding='utf-8') as fp:
        user_data = json.load(fp)
######################################################################################################################################
# route 설정 & 페이지 렌더링
@app.route('/')
def login_page():
    return render_template('login.html')

@app.route('/main.html')
def main_page():
    return render_template('main.html')

@app.route('/register.html')
def register_page():
    return render_template('register.html')
    
@app.route('/mypage.html')
def my_page():
    if oauth2.has_credentials():
        return render_template('mypage.html', useremail=oauth2.email)

@app.route('/containerList.html')
def containerList_page():
    if oauth2.has_credentials():
        return render_template('containerList.html', useremail=oauth2.email)

@app.route('/containerDash.html')
def containerDash_page():
    if oauth2.has_credentials():
        return render_template('containerDash.html', useremail=oauth2.email)

@app.route('/deploy.html')
def deploy_page():
    if oauth2.has_credentials():
        return render_template('deploy.html', useremail=oauth2.email)
######################################################################################################################################
# 로그인
@app.route('/login', methods=['GET', 'POST'])
@oauth2.required
def login():
    # http is authorized with the user's credentials and can be used
    # to make http calls.
    oauth = oauth2.http()
    # # Or, you can access the credentials directly
    credentials = oauth2.credentials
    # 로그인 계정의 이메일과 사용자 id를 받아옴

    if oauth2.has_credentials():
        # 로그인 성공 시, useremail을 리스트에 저장
        # useremail = oauth2.email
        return render_template('containerList.html', useremail=oauth2.email)
    else:
        return render_template('register.html')

# 로그아웃
# logout 버튼 클릭 시, 실행되도록 프론트와 연동해야 함.    !!!!!!!!!!!!!!!!!!!!!!!!
@app.route('/logout', methods=['POST', 'GET'])
def logout():
    # Clear the user's session to log them out
    session.clear()
    return render_template('login.html')
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
        back_env = request.form.getlist('dbEnv')         # 선택된 개발 환경 리스트 받기
        db_env = request.form.getlist('backEnv')         # 선택된 개발 환경 리스트 받기

        # json 데이터 초기화
        containers = []
        envx = [0]*16
        front = {}
        back = {}
        db = {}
        # 프론트/백/DB -> json 파일에 서비스명 + 컨테이너명(서비스명_Front/서비스면_Back/서비스명_DB) 설정
        if front_env is not None:
                front['name'] = program_name+'_Front'
                front['state'] = 'run'
        if db_env is not None:
                db['name'] = program_name+'_Db'
                db['state'] = 'run'
        if back_env is not None:
                back['name'] = program_name+'_Back'
                back['state'] = 'run'
        # json 파일에 env (개발환경) 설정
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
        front['env'] = front_env
        back['env'] = back_env
        db['env'] = db_env
        containers.append(front)
        containers.append(back)
        containers.append(db)

        # # BASE 경로 -> {현재 실행되는 path}/userSource/{user_email}
        # folder_path = os.path.join(BASE_DIR, 'userSource', user_email)
        # os.makedirs(folder_path, exist_ok=True)
        
        # # 저장할 파일의 경로 설정 -> 위의 BASE 경로에서 사용자 별로 배포한 프로그램명 단위로 파일 저장 -> {현재 실행되는 path}/userSource/{user_email}/{program_name}/{본래의 폴더명}
        # file_path = os.path.join(folder_path, program_name+'.zip')
        # file.save(file_path)
        
        # # 만약 업로드한 파일이 .zip 파일이라면 unzip 수행
        # if file_path.endswith('.zip'):
        #     unzip_folder_path = os.path.splitext(file_path)[0]  # .zip 확장자 제외한 경로
        #     with zipfile.ZipFile(file_path, 'r') as zip_ref:
        #         zip_ref.extractall(unzip_folder_path)
        #     # 체크한 개발 환경 기반으로 env_txt 파일 생성
        #     env_txt = ''
        #     for e in envx:
        #         env_txt += str(e)
        #     # 체크한 개발 환경 기반으로 env_txt 파일 저장
        #     env_txt_file_path = os.path.join(unzip_folder_path, 'env.txt')
        #     with open(env_txt_file_path, 'w') as f:
        #         f.write(env_txt)
        #     # username.txt 파일 생성 및 저장
        #     username_txt = user_email+':'+program_name
        #     username_txt_file_path = os.path.join(unzip_folder_path, 'username.txt')
        #     with open(username_txt_file_path, 'w', encoding='utf-8') as f:
        #         f.write(username_txt)
        #     os.remove(file_path)  # .zip 파일 삭제
                    
        #     # GitHub에 업로드
        #     # upload_to_github(os.path.join(BASE_DIR, 'userSource'))
        # else:
        #     return '.zip 파일을 업로드 해주세요.'

        # 사용자 이메일을 기준으로 데이터가 있는지 확인하고 데이터 추가 또는 새로운 사용자 JSON 객체 생성
        if oauth2.email in user_data:
            user_data[oauth2.email].append({
                'Service Name': program_name,
                'Containers' : containers,
                'Creating Date' : str(today_date)
            })
        else:
            user_data[oauth2.email] = [{
                'Service Name': program_name,
                'Containers' : containers,
                'Creating Date' : str(today_date)
            }]

        # JSON 파일에 데이터를 저장 (ensure_ascii 옵션을 False로 설정하여 한글이 유니코드로 저장되도록 함)
        with open(data_file_path, 'w', encoding='utf-8') as fp:
            json.dump(user_data, fp, sort_keys=True, indent=4, ensure_ascii=False)

        # 응답으로 JSON 형식의 데이터 반환
        return render_template('containerList.html', userData=json.dumps({oauth2.email: user_data[oauth2.email]}, ensure_ascii=False))
    elif request.method == 'GET':
        # state 수정해주어야 함.
        return json.dumps({oauth2.email: user_data[oauth2.email]}, ensure_ascii=False)
    return 'Fail'
    # if oauth2.has_credentials():
    #     return render_template('editDeploy.html', useremail=oauth2.email)
######################################################################################################################################
# @app.route('/editDeploy.html')
@app.route('/services/<string:service_name>')
def editDeploy_page(service_name):
    user_email = oauth2.email                            # 현재 로그인된 사용자 이메일
    if request.method == 'POST':
        file = request.files['uploadFile_name']          # 업로드되는 파일 받기
        program_name = service_name                      # 사용자가 배포하는 프로그램명 받기
        front_env = request.form.getlist('frontEnv')     # 선택된 개발 환경 리스트 받기
        back_env = request.form.getlist('dbEnv')         # 선택된 개발 환경 리스트 받기
        db_env = request.form.getlist('backEnv')         # 선택된 개발 환경 리스트 받기

        # json 데이터 초기화
        containers = []
        envx = [0]*16
        front = {}
        back = {}
        db = {}
        # 프론트/백/DB -> json 파일에 서비스명 + 컨테이너명(서비스명_Front/서비스면_Back/서비스명_DB) 설정
        if front_env is not None:
                front['name'] = program_name+'_Front'
                front['state'] = 'run'
        if db_env is not None:
                db['name'] = program_name+'_Db'
                db['state'] = 'run'
        if back_env is not None:
                back['name'] = program_name+'_Back'
                back['state'] = 'run'
        # json 파일에 env (개발환경) 설정
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
        front['env'] = front_env
        back['env'] = back_env
        db['env'] = db_env
        containers.append(front)
        containers.append(back)
        containers.append(db)

        # # BASE 경로 -> {현재 실행되는 path}/userSource/{user_email}
        # folder_path = os.path.join(BASE_DIR, 'userSource', user_email)
        # os.makedirs(folder_path, exist_ok=True)
        
        # # 저장할 파일의 경로 설정 -> 위의 BASE 경로에서 사용자 별로 배포한 프로그램명 단위로 파일 저장 -> {현재 실행되는 path}/userSource/{user_email}/{program_name}/{본래의 폴더명}
        # file_path = os.path.join(folder_path, program_name+'.zip')
        # file.save(file_path)
        
        # # 만약 업로드한 파일이 .zip 파일이라면 unzip 수행
        # if file_path.endswith('.zip'):
        #     unzip_folder_path = os.path.splitext(file_path)[0]  # .zip 확장자 제외한 경로
        #     with zipfile.ZipFile(file_path, 'r') as zip_ref:
        #         zip_ref.extractall(unzip_folder_path)
        #     # 체크한 개발 환경 기반으로 env_txt 파일 생성
        #     env_txt = ''
        #     for e in envx:
        #         env_txt += str(e)
        #     # 체크한 개발 환경 기반으로 env_txt 파일 저장
        #     env_txt_file_path = os.path.join(unzip_folder_path, 'env.txt')
        #     with open(env_txt_file_path, 'w') as f:
        #         f.write(env_txt)
        #     # username.txt 파일 생성 및 저장
        #     username_txt = user_email+':'+program_name
        #     username_txt_file_path = os.path.join(unzip_folder_path, 'username.txt')
        #     with open(username_txt_file_path, 'w', encoding='utf-8') as f:
        #         f.write(username_txt)
        #     os.remove(file_path)  # .zip 파일 삭제
                    
        #     # GitHub에 업로드
        #     # upload_to_github(os.path.join(BASE_DIR, 'userSource'))
        # else:
        #     return '.zip 파일을 업로드 해주세요.'

        # 사용자 이메일을 기준으로 데이터가 있는지 확인하고 데이터 추가 또는 새로운 사용자 JSON 객체 생성
        if program_name in user_data[oauth2.email]['Service Name']:
            for ud in user_data[oauth2.email]:
                 if ud['Service Name'] == program_name:
                    ud['Containers'] = containers
                    # user_data[oauth2.email]['Service Name'] = program_name
                    # user_data[oauth2.email]['Containers'] = containers
                    # user_data[oauth2.email]['Creating Date'] = str(today_date)
                    print(ud['Service Name'])
                    print(ud['Containers'])
        else:
            return '기존의 서비스 명과 동일하지 않습니다.'

        # JSON 파일에 데이터를 저장 (ensure_ascii 옵션을 False로 설정하여 한글이 유니코드로 저장되도록 함)
        with open(data_file_path, 'w', encoding='utf-8') as fp:
            json.dump(user_data, fp, sort_keys=True, indent=4, ensure_ascii=False)

        print(json.dump(user_data, fp, sort_keys=True, indent=4, ensure_ascii=False))

        # 응답으로 JSON 형식의 데이터 반환
        return render_template('containerList.html', userData=json.dumps({oauth2.email: user_data[oauth2.email]}, ensure_ascii=False))
    elif request.method == 'GET':
        # state 수정해주어야 함.
        return json.dumps({oauth2.email: user_data[oauth2.email]}, ensure_ascii=False)
    return 'Fail'
######################################################################################################################################
# 컨테이너 status 확인 (Running/Stop/Error?) / pip install paramiko
# def container_status():
#     ssh = paramiko.SSHClient()
#     ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
#     ssh.connect('150.136.87.94', port='22', username='opc', key_filename='./master-06-26.key')

#     stdin, stdout, stderr = ssh.exec_command('kubectl get pod -n test') # kubectl get deployment -n {$useremail}
#     output_lines = stdout.readlines()  # Capture the output in a variable

#     # Debug: print the output to check if it's as expected
#     print("=== Output ===")
#     print("".join(output_lines))
#     print("==============")

#     deployment_info = {}  # 딕셔너리로 저장할 변수

#     # 첫 번째 줄은 헤더이므로 무시하고, 두 번째 줄부터 파싱 시작
#     for line in output_lines[1:]:
#         line = line.strip()  # 줄바꿈 문자 제거
#         if not line:
#             continue  # 빈 줄은 무시

#         # 줄을 공백으로 분리하여 name과 status 정보 추출
#         columns = line.split()
#         name = columns[0]
#         status = columns[2]

#         # 딕셔너리에 name을 키로, status를 값으로 저장
#         deployment_info[name] = status

#     ssh.close()

#     return deployment_info  # 딕셔너리 반환

# result_dict = control_containers()
# print(result_dict)

######################################################################################################################################
# 컨테이너 제어 작업 (stop/restart/delete) / pip install paramiko
# @app.route('/controls', methods=['POST', 'GET'])
# def control_containers():
#     ssh = paramiko.SSHClient()
#     ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
#     ssh.connect('150.136.87.94', port='22', username='opc', key_filename='C:\Users\OWNER\my-key\master-06-26.key')

#     stdin, stdout, stderr = ssh.exec_command('kubectl get pod -n test')
#     print(''.join(stdout.readlines()))

#     ssh.close()

# stop 버튼
# kubectl scale deployment front-deployment --replicas=0 -n <$Username>
# kubectl scale deployment back-deployment --replicas=0 -n <$Username>
# kubectl scale deployment db-deployment --replicas=0 -n <$Username>
# restart 버튼
# kubectl scale deployment front-deployment --replicas=2 -n <$Username>
# kubectl scale deployment back-deployment --replicas=2 -n <$Username>
# kubectl scale deployment db-deployment --replicas=2 -n <$Username>
# delete 버튼
# kubectl delete deployment front-deployment -n <$Username>
# kubectl delete service front-service -n <$Username>
# kubectl delete deployment back-deployment -n <$Username>
# kubectl delete service back-service -n <$Username>
# kubectl delete deployment db-deployment -n <$Username>
# kubectl delete service db-service -n <$Username>
# kubectl delete pv <$Username>-pv -n <$Username>
# kubectl delete pvc <$Username>-pvc -n <$Username>
######################################################################################################################################
# 파일 업로드 & Git Push 자동화
# 해당 폴더에서 미리 userSource 폴더 안에서 [1. git init] [2. git remote add origin <깃허브주소링크>] 셋팅해주어야 함.
# 폴더 경로 -> userSource/{user_email}/{program_name}/{unzip_files}
# teamnonstop github 엑세스 토큰 - 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
def upload_to_github(local_path):
    try:
        # Git 초기화
        #subprocess.call(['git', 'init'], cwd=local_path, shell=True)

        # 모든 파일을 스테이징
        subprocess.call(['git', 'add', '.'], cwd=local_path, shell=True)

        # 커밋 메시지 작성
        commit_message = 'File upload'
        subprocess.call(['git', 'commit', '-m', commit_message], cwd=local_path, shell=True)

        # GitHub 원격 저장소로 푸시 / origin master 브랜치로 생성해야 push 됨 // 리포지토리 수정 필요!!!!!!!!!!!!!!!
        subprocess.call(['git', 'push', 'https://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@github.com/teamnonstop/test_project.git'], cwd=local_path, shell=True)

    except subprocess.CalledProcessError as e:
        print(f"Error occurred during Git commands: {e}")
        # 예외 처리
######################################################################################################################################

if __name__ == '__main__':
    app.run(port="8080", debug=True)