FROM maven:3.6.3-openjdk-8 AS builder

WORKDIR /app
COPY . .
# Configure Maven for better reliability with network issues
COPY settings.xml /root/.m2/settings.xml
RUN mvn dependency:go-offline -DskipTests || true
RUN mvn clean package -DskipTests -Dmaven.wagon.http.retryHandler.count=3 -Dmaven.wagon.http.retryHandler.requestSentEnabled=true

FROM openjdk:8-jdk-alpine
WORKDIR /app
COPY --from=builder /app/target/users-api-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8002
ENTRYPOINT ["java","-jar","app.jar"]
