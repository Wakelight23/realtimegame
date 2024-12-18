import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

let gameAssets = {};

// 현재 경로를 찾기 위해서 어떻게 해야하는가
// import.meta.url = 현재 파일의 절대경로
const __filename = fileURLToPath(import.meta.url);
// 그 절대 경로를 어떻게 사용하느냐
// __dirname 위치의 파일 이름을 제외한 경로
const __dirname = path.dirname(__filename);
// assets 폴더가 존재하는 곳을 찾음
const basePath = path.join(__dirname, '../../assets');

// 파일 읽는 함수
// 파일은 비동기 병렬로 읽는다.
// 비동기 : 한 번에 같이 처리가 된다
const readFileAsync = (filename) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(basePath, filename), 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(JSON.parse(data));
    });
  });
};

// Promise.all()
export const loadGameAssets = async () => {
  try {
    const [stages, items, itemUnlocks] = await Promise.all([
      readFileAsync('stage.json'),
      readFileAsync('item.json'),
      readFileAsync('item_unlock.json'),
    ]);

    gameAssets = { stages, items, itemUnlocks };
    return gameAssets;
  } catch (e) {
    throw new Error('Failed to load game assets: ' + e.message);
  }
};

export const getGameAssets = () => {
  return gameAssets;
};
