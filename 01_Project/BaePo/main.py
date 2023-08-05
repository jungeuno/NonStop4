from oauth2client.contrib.flask_util import UserOAuth2
from flask import Flask, render_template, request, session, redirect, url_for, jsonify
import subprocess
import os
import zipfile
import json

app = Flask(__name__)

# 현재 경로
BASE_DIR = os.getcwd()

# 구글 로그인 API 클라이언트 ID & PASSWORD
app.config['SECRET_KEY'] = 'AIzaSyCHUx1bpNdKFMJ_3lvwaCbw15PabF1JNpw'
app.config['GOOGLE_OAUTH2_CLIENT_SECRETS_FILE'] = 'client_secret_9542596386-2kkmu7fkdv00p6pomousdniphu0job4i.apps.googleusercontent.com.json'

oauth2 = UserOAuth2(app)

# JSON 파일 경로
data_file_path = 'data.json'
# JSON 파일을 읽어서 데이터를 저장할 딕셔너리 생성
user_data = {}
if os.path.exists(data_file_path):
    with open(data_file_path, 'r', encoding='utf-8') as fp:
        user_data = json.load(fp)

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
    
@app.route('/editDeploy.html')
def editDeploy_page():
    if oauth2.has_credentials():
        return render_template('editDeploy.html', useremail=oauth2.email)

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

# Note that app.route should be the outermost decorator.
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

# 사용자별 배포 목록
# 사용자 이름과 배포명 추가 -> json 파일로 저장
# 사용자 이름 해당하면 배포명 (리스트) json dump 반환
# deploy.html 에서 배포하기 버튼 클릭 시, append 되어야 함. -> deployList() 함수 실행돼야 함.
# json.dump 파일 프론트로 렌더링 되는지 확인 -> 상태 값은 모니터링 때, 받아올 수 있음 / 개발 환경은 프론트 체크 박스에서 받아와야 함. 

# /services 경로에 대한 엔드포인트 함수
@app.route('/services', methods=['POST', 'GET'])
def handle_user_services():
    user_email=oauth2.email
    if request.method == 'POST':
        if 'uploadFile_name' in request.files:
            file = request.files['uploadFile_name']  # 업로드되는 파일 받기
            file_name = file.filename
        else:
            file_name = None

        program_name = request.form['service_name']  # 사용자가 배포하는 프로그램명 받기
        envx = request.form.getlist('envx')          # 선택된 개발 환경 리스트 받기
        user_email = oauth2.email

        # 폼 데이터 및 파일 정보를 확인하는 코드 (테스트용)
        print('User :', user_email)
        print('Service Name:', program_name)
        print('Uploaded File Name:', file_name)
        print('file: ', file)
        print('envx:', envx)


        env = [0]*16
        front = None
        back = None
        db = None
        # 프론트/백/DB 나누는 기준 -> 서비스명 + 컨테이너명(=서비스명_Front/서비스면_Back/서비스명_DB) 설정해주기
        for ex in envx:
            ex = int(ex)
            if ex in [0, 1, 2, 3, 4, 5, 6]:
                env[ex] = 1
                front = program_name+'_Front'
            elif ex in [7, 8, 9]:
                env[ex] = 1
                db = program_name+'_DB'
            elif ex in [10, 11, 12, 13, 14, 15]:
                env[ex] = 1
                back = program_name+'_Back'

        # 체크한 개발 환경 기반으로 env_txt 파일 생성
        # env_txt = ''
        # for e in env:
        #     env_txt += str(e)
        # with open('env.txt', 'w') as f:
        #     f.write(env_txt)

        # file_upload() & gitPush() 폴더 저장 및 깃푸시
        # file_upload(user_email, program_name, file)

        # # 사용자 이메일을 기준으로 데이터가 있는지 확인하고 데이터 추가 또는 새로운 사용자 객체 생성
        if oauth2.email in user_data:
            user_data[oauth2.email].append({
                'Service Name': program_name,
                'Front' : front,
                'Back' : back,
                'DB' : db,
                'State': 'run',
                'Envx': envx
            })
        else:
            user_data[oauth2.email] = [{
                'Service Name': program_name,
                'Front' : front,
                'Back' : back,
                'DB' : db,
                'State': 'run',
                'Envx': envx
            }]

        # JSON 파일에 데이터를 저장 (ensure_ascii 옵션을 False로 설정하여 한글이 유니코드로 저장되도록 함)
        with open(data_file_path, 'w', encoding='utf-8') as fp:
            json.dump(user_data, fp, sort_keys=True, indent=4, ensure_ascii=False)

        # 응답으로 JSON 형식의 데이터 반환
        print(json.dumps({user_email: user_data[user_email]}, ensure_ascii=False))

        # 응답으로 JSON 형식의 데이터 반환
        return render_template('containerList.html', userData=json.dumps({user_email: user_data[user_email]}, ensure_ascii=False))
    elif request.method == 'GET':
        # state 수정해주어야 함.
        return json.dumps({user_email: user_data[user_email]}, ensure_ascii=False)
    return 'Fail'


# 파일 업로드 & Git Push 자동화
# 해당 폴더에서 미리 userSource 폴더 안에서 [1. git init] [2. git remote add origin <깃허브주소링크>] 셋팅해주어야 함.
# 폴더 경로 -> userSource/{user_email}/{program_name}/{unzip_files}
@app.route('/upload', methods=['GET', 'POST'])
# 엔드포인트가 필요한가? -> 프론트와 연동 방법 고민 필요함 !!!!!!!!!!!!!!!!!!!!!!!!!!!
def file_upload(user_email, program_name, file):
    if request.method == 'POST':
        file = request.files['file']                # 업로드되는 파일 받기
        user_email = oauth2.email                    # useremail
        program_name = request.form['program_name']  # 사용자가 작성하는 프로그램명 받기
        file_name = file.filename

        # folder_name = f"{user_email}"                # 폴더명 (사용자 이름)
        # program_name = f"{program_name}"             # 폴더명 (프로그램 명)
        # file_name = f"{file_name}"                   # 파일명 (파일 명)

        folder_path = os.path.join(BASE_DIR, 'userSource', user_email, '/', program_name)
        os.makedirs(folder_path, exist_ok=True)

        # 저장할 파일의 경로 설정
        file_path = os.path.join(folder_path, file_name)
        file.save(file_path)

        # 만약 업로드한 파일이 .zip 파일이라면 unzip 수행 // 파일 경로 논의 필요    !!!!!!!!!!!!!!!!!!
        if file_path.endswith('.zip'):
            unzip_folder_path = os.path.splitext(file_path)[0]  # .zip 확장자 제외한 경로
            with zipfile.ZipFile(file_path, 'r') as zip_ref:
                zip_ref.extractall(unzip_folder_path)
            os.remove(file_path)  # .zip 파일 삭제

        # GitHub에 업로드
        #upload_to_github(os.path.join(BASE_DIR, 'userSource'))

        return render_template('containerList.html')
    else:
        return render_template('upload.html')

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

# teamnonstop github 엑세스 토큰 - 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

if __name__ == '__main__':
    app.run(port="8080", debug=True)