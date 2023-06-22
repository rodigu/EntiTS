function introSplashScreen(manager: GameManager) {
  const logoNucleo = manager.getAsset(GameAssets.LOGO_NUCLEO) as p5.Image;
  let fadeAlpha = 0;

  manager.position = createVector(width / 2, height / 2);

  manager.addState(GameStates.INTRO_SCREEN, (m) => {
    background(0);
    image(logoNucleo, 0, 0, manager.UnitSize * 3, manager.UnitSize * 3);
    // manager.playAudio(GameAssets.VINHETA_NUCLEO);

    if (fadeAlpha > 250) manager.state = GameStates.TITLE_SCREEN;
    fadeAlpha += 5;
    background(0, fadeAlpha);
  });
}
