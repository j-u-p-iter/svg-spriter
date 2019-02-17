import * as fs from "fs";
import * as mkdirp from "mkdirp";
import * as path from "path";
import SVGSpriter, { Config, SVGSpriter as ISVGSpriter } from "svg-sprite";
import * as util from "util";

export interface SpriteConfig {
  [category: string]: {
    [name: string]: any;
  };
}

const createSpriter = (config: Config): ISVGSpriter =>
  new SVGSpriter({
    ...config,
    shape: {
      id: {
        generator(fileName) {
          return fileName.split("#")[1];
        }
      }
    }
  });

export const normalizeSprites = (data: SpriteConfig): string[] =>
  Object.keys(data).reduce(
    (resultArray, spriteCategory) => {
      const categoryPaths = Object.keys(data[spriteCategory]).map(
        fileName =>
          `${data[spriteCategory][fileName]}#${spriteCategory}-${fileName}`
      );

      return [...resultArray, ...categoryPaths];
    },
    [] as string[]
  );

const compileSprite = (spriter: ISVGSpriter): Promise<any> => {
  const compile = util.promisify(spriter.compile.bind(spriter));

  return compile();
};

const addSprites = (spriter: ISVGSpriter, filesList: string[]): ISVGSpriter => {
  filesList.forEach(fileInfoString => {
    const fileInfoArray = fileInfoString.split("#");
    const absolutePathToFile = fileInfoArray[0];

    spriter.add(
      fileInfoString,
      "",
      fs.readFileSync(absolutePathToFile, { encoding: "utf-8" })
    );
  });

  return spriter;
};

export const generateSprite = (
  config: Config,
  sprites: SpriteConfig,
  outputDirPath: string
): ReturnType<typeof compileSprite> => {
  const spriter = createSpriter(config);
  const spritesList = normalizeSprites(sprites);

  return compileSprite(addSprites(spriter, spritesList))
    .then(({ symbol: { sprite } }) => {
      const dirName = path.dirname(outputDirPath);

      mkdirp.sync(dirName);

      fs.writeFileSync(outputDirPath, sprite.contents);
    })
    .catch(error => {
      console.error(error);
    });
};
