# 파일 업로드 & Git Push 자동화
import subprocess
import os
from flask import Flask, render_template, request

app = Flask(__name__)

# 현재 경로
BASE_DIR = os.getcwd()

@app.route('/upload', methods=['GET', 'POST'])
def file_upload():
    if request.method == 'POST':
        file = request.files['file']                # 업로드되는 파일 받기
        username = request.form['username']         # 사용자가 작성하는 사용자명 받기
        programname = request.form['program_name']  # 사용자가 작성하는 프로그램명 받기
        filename = file.filename

        folder_name = f"{username}"                 # 폴더명 (사용자 이름)
        program_name = f"{programname}"             # 폴더명 (프로그램 명)
        file_name = f"{filename}"                   # 파일명 (파일 명)

        folder_path = os.path.join(BASE_DIR, 'userSource', folder_name, program_name)
        os.makedirs(folder_path, exist_ok=True)

        # 저장할 파일의 경로 설정
        file_path = os.path.join(folder_path, file_name)
        file.save(file_path)

        # GitHub에 업로드
        upload_to_github(os.path.join(BASE_DIR, 'userSource'))

        return '파일이 저장되었습니다.'
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

        # GitHub 원격 저장소로 푸시 / origin master 브랜치로 생성해야 push 됨.
        subprocess.call(['git', 'push', 'https://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@github.com/teamnonstop/test_project.git'], cwd=local_path, shell=True)

    except subprocess.CalledProcessError as e:
        print(f"Error occurred during Git commands: {e}")
        # 예외 처리

# 엑세스 토큰 - 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

# 사용 예시
if __name__ == '__main__':
    app.run(port="9999", debug=True)
