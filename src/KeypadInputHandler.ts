export class KeypadInputHandler{
    private static keyMap = new Map<string, number>([
        ["1", 0x1],["2", 0x2],["3", 0x3],["4", 0xc], // 1 2 3 C
        ["q", 0x4],["w", 0x5],["e", 0x6],["r", 0xd], // 4 5 6 D
        ["a", 0x7],["s", 0x8],["d", 0x9],["f", 0xe], // 7 8 9 E
        ["z", 0xa],["x", 0x0],["c", 0xb],["v", 0xf]  // A 0 B F
    ]);

    public static translatePhysicalKeyboardInputToKeypad(event:KeyboardEvent):number | undefined{
        return this.keyMap.get(event.key);
    }
}