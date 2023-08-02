from oauth2client.contrib.flask_util import UserOAuth2
from flask import Flask, render_template, request, session, redirect, url_for
import subprocess
import os
import zipfile
from flask import Flask, render_template, request

app = Flask(__name__)

# 현재 경로
BASE_DIR = os.getcwd()

# 구글 로그인 API 클라이언트 ID & PASSWORD
app.config['SECRET_KEY'] = 'AIzaSyCHUx1bpNdKFMJ_3lvwaCbw15PabF1JNpw'
app.config['GOOGLE_OAUTH2_CLIENT_SECRETS_FILE'] = 'client_secret_9542596386-2kkmu7fkdv00p6pomousdniphu0job4i.apps.googleusercontent.com.json'

oauth2 = UserOAuth2(app)

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
    # return "Hello, {} ({})".format(oauth2.email, oauth2.user_id)

    if oauth2.has_credentials():
        return render_template('containerList.html', useremail=oauth2.email)
    else:
        return render_template('register.html')

# 로그아웃
# logout 버튼 클릭 시, 실행되도록
@app.route('/logout')
def logout():
    # Clear the user's session to log them out
    session.clear()
    return render_template('login.html')

# 사용자별 배포 목록
# 사용자 이름과 배포명 추가 -> json 파일로 저장
# 사용자 이름 해당하면 배포명 리스트 반환 
def deployList():

    return render_template('containerList.html')

# 파일 업로드 & Git Push 자동화
# 해당 폴더에서 미리 userSource 폴더 안에서 [1. git init] [2. git remote add origin <깃허브주소링크>] 셋팅해주어야 함.
# 프론트에서 개발 환경 변수 받아와서 env.txt 파일 생성
@app.route('/upload', methods=['GET', 'POST'])
# 엔드포인트가 필요한가? -> 프론트와 연동 방법 고민 필요함
def file_upload():
    if request.method == 'POST':
        file = request.files['file']                # 업로드되는 파일 받기
        username = request.form['username']         # 사용자가 작성하는 사용자명 받기
        programname = request.form['program_name']  # 사용자가 작성하는 프로그램명 받기
        filename = file.filename

        folder_name = f"{username}"                 # 폴더명 (사용자 이름)
        program_name = f"{programname}"             # 폴더명 (프로그램 명)
        file_name = f"{filename}"                   # 파일명 (파일 명)

        folder_path = os.path.join(BASE_DIR, 'userSource', folder_name)
        os.makedirs(folder_path, exist_ok=True)

        # 저장할 파일의 경로 설정
        file_path = os.path.join(folder_path, file_name)
        file.save(file_path)

        # 만약 업로드한 파일이 .zip 파일이라면 unzip 수행 // 파일 경로 논의 필요!!!!!!!!!!!!!!!!!!
        if file_path.endswith('.zip'):
            unzip_folder_path = os.path.splitext(file_path)[0]  # .zip 확장자 제외한 경로
            with zipfile.ZipFile(file_path, 'r') as zip_ref:
                zip_ref.extractall(unzip_folder_path)
            os.remove(file_path)  # .zip 파일 삭제

        # GitHub에 업로드
        upload_to_github(os.path.join(BASE_DIR, 'userSource'))

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
# ㄴ> 7/23 만료 예정, 갱신 필요

if __name__ == '__main__':
    app.run(port="8080", debug=True)