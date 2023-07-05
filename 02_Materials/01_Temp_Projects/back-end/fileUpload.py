# 소스코드 파일 업로드하기
# 파일 저장 test
from flask import Flask, render_template, request
#from werkzeug.utils import secure_filename
import os
from pathlib import Path

app = Flask(__name__)

# 현재 경로
BASE_DIR = os.getcwd()

@app.route('/upload', methods = ['GET', 'POST'])
def file_upload():
    if request.method == 'POST':
        file = request.files['file']                # 업로드되는 파일 받기
        username = request.form['username']         # 사용자가 작성하는 사용자명 받기
        program_name = request.form['program_name'] # 사용자가 작성하는 프로그램명 받기
        filename = file.filename

        folder_name = f"{username}"                 # 폴더명 (사용자 이름)
        file_name = f"{program_name}_{filename}"    # 파일명 (프로그램 명_파일 명)

        folder_path = os.path.join(BASE_DIR, 'userSource/' + folder_name)
        os.makedirs(folder_path, exist_ok=True)

        # 저장할 폴더의 경로 설정
        os.chdir(folder_path)
        file.save(file_name)

        os.getcwd()

        return '파일이 저장되었습니다'
    else: 
        return render_template('upload.html')
		
if __name__ == '__main__':
    app.run(port="9999",debug = True)