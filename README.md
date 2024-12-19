# 웹소켓 게임 만들기 (Real Time Game)

### 🏁 게임 시스템

- 기본적으로 오른쪽을 이동하면서 장애물을 피하는 게임
- 방향키로 좌우 이동하며 점프가 가능

### 🏃‍♂️‍➡️ Stage

###  Stage 기획

- 오래 버틸수록 높은 점수 획득 (시간에 따른)
- 아이템 종류에 따라서 추가 점수 획득

###  Stage에 따라서 더 높은 점수 획득

- 0점 , 1스테이지
- 50점, 2스테이지 등 설정된 점수에 따라 스테이지 이동
- 위와 같이 점수로 나뉘어서 스테이지 구분
- 스테이지가 올라갈수록 시간당 높은 점수 획득 가능

### 🕹️ Item

### 아이템 종류에 따라 다른 점수 획득

- 이동 중 아이템 무작위 생성

### Stage에 따라 생성되는 아이템 구분

- 1스테이지에는 1번 아이템만,
  2스테이지에는 2번 아이템까지 나오는 것
- 높은 스테이지의 아이템에서는 더 높은 점수 획득 가능

### 도전 기능

- broadcast로 플레이어 중 최고 기록 점수 알림 구현
- 동시에 플레이하고 있을 경우 최고 점수 갱신되었을 시 console에 출력

### 기술 스택

<img src="https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"><img src="https://img.shields.io/badge/node.js-339933?style=for-the-badge&logo=Node.js&logoColor=white"><img src="https://img.shields.io/badge/express-000000?style=for-the-badge&logo=express&logoColor=white"><img src="https://img.shields.io/badge/github-181717?style=for-the-badge&logo=github&logoColor=white"><img src="https://img.shields.io/badge/git-F05032?style=for-the-badge&logo=git&logoColor=white"><img src="https://img.shields.io/badge/socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white">
