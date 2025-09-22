FROM maven:3.9.4-eclipse-temurin-17 AS builder

WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY --from=builder /app/target/users-api-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8002
ENTRYPOINT ["java","-jar","app.jar"]
