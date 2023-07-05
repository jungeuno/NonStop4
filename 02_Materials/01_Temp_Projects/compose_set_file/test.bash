FILE="./env.txt"
if [ -e "$FILE" ]; then
        touch docker-compose.yml
	echo services: > docker-compose.yml
    filenv=$(cat "$FILE" | grep -o .)
    count=0
    for i in $filenv; do
        if [ $i -eq 1 ]; then
                case $count in
                0)      echo "apache"
                        echo "  frontesd:" >> docker-compose.yml
                        echo "    image: httpd:latest" >> docker-compose.yml
			echo "    restart: always" >> docker-compose.yml
                        echo "    ports:" >> docker-compose.yml
                        echo "      - \"80:80\"" >> docker-compose.yml
                        echo "    volumes:" >> docker-compose.yml
                        echo "      - /var/lib/jenkins/workspace/Yoontest/frontend:/var/www/html" >> docker-compose.yml
                        ;;
                1)      echo "nginx"
			echo "  frontend:" >> docker-compose.yml
                        echo "    image: nginx:latest" >> docker-compose.yml
			echo "    restart: always" >> docker-compose.yml
                        echo "    ports:" >> docker-compose.yml
                        echo "      - 3333:80" >> docker-compose.yml
                        echo "    volumes:" >> docker-compose.yml
                        echo "      - /var/lib/jenkins/workspace/Yoontest/frontend:/usr/share/nginx/html" >> docker-compose.yml


                        ;;
                2)      echo "bootstrap"
						mkdir frontend && mv ./*.html ./frontend && mv ./*.css ./frontend && mv ./*.js ./frontend
                        ;;                                                                                                                                                                                                                                                        
                3)      echo "vue"
						mkdir frontend && mv ./*.html ./frontend && mv ./*.css ./frontend && mv ./*.js ./frontend 
                        ;;                                                                                                                                                                                                                                                        
                4)      echo "react"       
						mkdir frontend && mv ./*.html ./frontend && mv ./*.css ./frontend && mv ./*.js ./frontend
                        ;;                                                                                                                                                                                                                                                        
                5)      echo "django"
                        echo "RUN python -m pip install --upgrade pip" >> front                                                                                                                                                                                                   
                        echo "RUN pip3 install django" >> front                                                                                                                                                                                                                   
                        ;;                                                                                                                                                                                                                                                        
                6)      echo "springboot"                                                                                                                                                                                                                                         
                        echo "RUN apt-get install -y openjdk-11jdk" >> front                                                                                                                                                                                                      
                        echo "RUN echo JAVA_HOME=\"/usr/lib/jvm/java-11-openjdk-arm64\" >> /etc/enviroment" >> front                                                                                                                                                              
                        echo "RUN source /etc/enciroment" >> front                                                                                                                                                                                                                
                        echo "RUN java java -jar \'springboot.jar\'" >> front                                                                                                                                                                                                     
                        ;;                                                                                                                                                                                                                                                        
                7)      echo "mysql"
			mkdir sql && mv *.sql sql/
			echo "  db:" >> docker-compose.yml
    			echo "    image: mysql" >> docker-compose.yml
    			echo "    restart: always" >> docker-compose.yml
    			echo "    environment:" >> docker-compose.yml
      			echo "      MYSQL_ROOT_PASSWORD: your_mysql_root_password" >> docker-compose.yml
      			echo "      MMYSQL_DATABASE: your_mysql_database_name" >> docker-compose.yml
      			echo "      MMYSQL_USER: your_mysql_username" >> docker-compose.yml
      			echo "      MMYSQL_PASSWORD: your_mysql_password" >> docker-compose.yml
			echo "    volumes:" >> docker-compose.yml
			echo "    - /var/lib/jenkins/workspace/Yoontest/sql:/var/lib/mysql" >> docker-compose.yml
                        ;;                                                                                                                                                                                                                                                        
                8)      echo "mssql"                                                                                                                                                                                                                                              
                        echo "RUN apt-get install -y wget" >> db                                                                                                                                                                                                                  
                        echo "RUN wget -qO- https://packages.microsoft.com/keys/microsoft.asc | sudo apt-key add -" >> db                                                                                                                                                         
                        echo "RUN add-apt-repository \"$(wget -qO- https://packages.microsoft.com/config/ubuntu/18.04/mssql-server-2019.list)\"" >>db                                                                                                                             
                        echo "RUN apt-get update" >> db                                                                                                                                                                                                                           
                        echo "RUN apt-get install -y mssql-server" >> db                                                                                                                                                                                                          
                        echo "RUN /opt/mssql/bin/mssql-conf setup" >> db #durldptj answp qkftod https://minddong.tistory.com/41                                                                                                                                                   
                        ;;                                                                                                                                                                                                                                                        
                9)      echo "mariandb"                                                                                                                                                                                                                                           
                        ;;                                                                                                                                                                                                                                                        
                10)     echo "kotlin"                                                                                                                                                                                                                                             
                        ;;                                                                                                                                                                                                                                                        
                11)     echo "python" 
			mkdir backend && mv *.py backend/
			echo "  backend:" >> docker-compose.yml
			echo "    volumes:" >> docker-compose.yml
			echo "      - /var/lib/jenkins/workspace/Yoontest/backend:/backend" >> docker-compose.yml
			echo "    build:" >> docker-compose.yml
			echo "      context: ." >> docker-compose.yml
			echo "      dockerfile: pydockerfile" >> docker-compose.yml
			echo "    restart: always" >> docker-compose.yml
                        ;;                                                                                                                                                                                                                                                        
                12)     echo "c#"                                                                                                                                                                                                                                                 
                        ;;                                                                                                                                                                                                                                                        
                13)     echo "go"                                                                                                                                                                                                                                                 
                        ;;                                                                                                                                                                                                                                                        
                14)     echo "rust"                                                                                                                                                                                                                                                
                        ;;
                15)     echo "ruby"
                        ;;
                esac
        fi
        count=$(($count+1))
    done

fi

