# GitHub에 소스코드 자동 업로드
# userSource 폴더에서 자동 push
# 쉘 스크립트 실행
# subprocess.call() 함수 사용
import subprocess

# 사용자의 이름과 프로그램 명 받아오기
username=''
program_name=''

#subprocess.call(["ls"], cwd="/Users/")
# 프로그램의 실행 경로 설정 가능
def gitPush():
    subprocess.call('git add .', shell=True)
    subprocess.call('git commit -m "{0}"'.format(username,'_',program_name), shell=True)
    subprocess.call('git push', shell=True)
