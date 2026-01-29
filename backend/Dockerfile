FROM tomcat:9.0-jdk11

RUN rm -rf /usr/local/tomcat/webapps/*

ARG WAR_FILE=target/smart-queue.war
COPY ${WAR_FILE} /usr/local/tomcat/webapps/ROOT.war

EXPOSE 8080

CMD ["catalina.sh", "run"]

