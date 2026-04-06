The follow APIs are needed to make all of the spells work:

    ScriptCards (with 5E, System Neutral (SN), and Farsidelib libraries)

    SmartAOE

    TokenMod

    Bump

    ChatSetAttr

    Radar

    SelectManager
  
    SpawnDefaultToken




Any Spell with "Token" at the end is meant to go on the spell's token as an ability,  with the "Show as Token Action" box checked.


All spells will identify NPC and PC targets. PC targets will have Bless and Guidance automatically added to their saving throw. Inspiration and Bardic Inspiration will need to be handled by the GM and Player after the face.

All Spells will look in the Global Save Modifiers area for granting Advantage to Saving Throws. Ex: Fey Ancestry for Elves gives advantage against being Charmed. Add a Global Save Modifier named charm with a roll of 0. Leave it unchecked so that it does not show up on other rolls but all spells with saving throws using charm will find and apply it to the current roll (turn Disadvantage -> Normal and Normal -> Advantage).

While I COULD add those queries into the saving throws for PC targets, it slows down the flow of the game too much and there is no really clean way to handle the output from that while preserving the ability to mouse over the roll and see the results.


