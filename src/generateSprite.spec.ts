import * as fs from "fs";
import * as path from "path";
import * as rimraf from "rimraf";
import { generateSprite, SpriteConfig } from ".";

describe("generateSprite", () => {
  let spriteConfig: SpriteConfig;
  let fileToCreatePath: string;

  beforeAll(() => {
    const pathToMDIcons = (basePath: string): string =>
      path.join(
        path.dirname(require.resolve("material-design-icons")),
        basePath
      );

    fileToCreatePath = path.join(__dirname, "./output/sprite.svg");

    spriteConfig = {
      category1: {
        success: pathToMDIcons(
          "/action/svg/production/ic_check_circle_24px.svg"
        ),
        compare: pathToMDIcons(
          "/action/svg/production/ic_compare_arrows_24px.svg"
        )
      },
      category2: {
        success: pathToMDIcons(
          "/action/svg/production/ic_check_circle_24px.svg"
        ),
        compare: pathToMDIcons(
          "/action/svg/production/ic_compare_arrows_24px.svg"
        )
      }
    };
  });

  afterEach(() => {
    const spriteDirPath = path.dirname(fileToCreatePath);

    if (fs.existsSync(spriteDirPath)) {
      rimraf.sync(path.dirname(fileToCreatePath));
    }
  });

  it("generates sprite properly", async () => {
    await generateSprite(
      { mode: { symbol: true } },
      spriteConfig,
      path.resolve(__dirname, fileToCreatePath)
    );

    const fileContent = fs.readFileSync(fileToCreatePath, {
      encoding: "utf-8"
    });

    expect(fileContent).toMatchSnapshot();
  });

  it("outputs error in case of error happens during sprite compiling", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await generateSprite(
      { mode: { symbol: true } },
      spriteConfig,
      path.resolve(__dirname, "")
    );

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

    consoleErrorSpy.mockRestore();
  });

  it("doesn`t throw when sprite config is empty", async () => {
    await generateSprite(
      { mode: { symbol: true } },
      {},
      path.resolve(__dirname, fileToCreatePath)
    );

    const fileContent = fs.readFileSync(fileToCreatePath, {
      encoding: "utf-8"
    });

    expect(fileContent).toMatchSnapshot();
  });
});
