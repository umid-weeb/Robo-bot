import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { useState, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Play,
  RotateCcw,
} from "lucide-react-native";

const GRID_SIZE = 7;
const { width, height } = Dimensions.get("window");
const cellSize = Math.min((width - 40) / GRID_SIZE, 50);
const gridWidth = cellSize * GRID_SIZE;

type Direction = 0 | 1 | 2 | 3;
type Command =
  | "move_forward"
  | "turn_left"
  | "turn_right"
  | "pick_up"
  | "insert";

export default function RobotGame() {
  const [x, setX] = useState(1);
  const [y, setY] = useState(5);
  const [dir, setDir] = useState<Direction>(1);
  const [hasDisk, setHasDisk] = useState(false);
  const [commands, setCommands] = useState<Command[]>([]);
  const [level, setLevel] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [diskPos, setDiskPos] = useState({ x: 3, y: 3 });
  const [serverPos, setServerPos] = useState({ x: 5, y: 1 });
  const [showNextLevel, setShowNextLevel] = useState(false);

  const addCommand = (cmd: Command) => {
    if (isRunning) return;
    setCommands([...commands, cmd]);
  };

  const deleteCommand = (index: number) => {
    const newCommands = [...commands];
    newCommands.splice(index, 1);
    setCommands(newCommands);
  };

  const reset = () => {
    if (isRunning) return;
    setX(1);
    setY(5);
    setDir(1);
    setHasDisk(false);
    setCommands([]);
    setMessage("");
    setShowNextLevel(false);
  };

  const showMsg = (text: string, type: string = "") => {
    setMessage(text);
    setMessageType(type);
  };

  const moveForward = () => {
    setX((prevX) => {
      setY((prevY) => {
        let newX = prevX,
          newY = prevY;
        if (dir === 0 && prevY > 0) newY--;
        else if (dir === 1 && prevX < 6) newX++;
        else if (dir === 2 && prevY < 6) newY++;
        else if (dir === 3 && prevX > 0) newX--;
        return newY;
      });
      let newX = prevX;
      if (dir === 1 && prevX < 6) newX++;
      else if (dir === 3 && prevX > 0) newX--;
      return newX;
    });
  };

  const turnLeft = () => {
    setDir((prevDir) => ((prevDir + 3) % 4) as Direction);
  };

  const turnRight = () => {
    setDir((prevDir) => ((prevDir + 1) % 4) as Direction);
  };

  const pickUp = () => {
    if (x === diskPos.x && y === diskPos.y && !hasDisk) {
      setHasDisk(true);
      showMsg("💾 Disk olindi!", "success");
    } else if (hasDisk) {
      showMsg("❌ Siz allaqachon disk ko'taryapsiz!", "error");
    } else {
      showMsg("❌ Bu yerda disk yo'q!", "error");
    }
  };

  const insert = () => {
    if (x === serverPos.x && y === serverPos.y && hasDisk) {
      showMsg("🎉 TABRIKLAYMIZ! Disk serverga joylandi!", "success");
      setHasDisk(false);
      setTimeout(() => {
        setShowNextLevel(true);
      }, 1000);
    } else if (x === serverPos.x && y === serverPos.y && !hasDisk) {
      showMsg("❌ Avval diskni oling!", "error");
    } else {
      showMsg("❌ Bu joyda server yo'q!", "error");
    }
  };

  const executeCommand = (cmd: Command) => {
    switch (cmd) {
      case "move_forward":
        moveForward();
        break;
      case "turn_left":
        turnLeft();
        break;
      case "turn_right":
        turnRight();
        break;
      case "pick_up":
        pickUp();
        break;
      case "insert":
        insert();
        break;
    }
  };

  const run = async () => {
    if (isRunning || commands.length === 0) return;
    setIsRunning(true);
    showMsg("🤖 Dastur bajarilmoqda...", "");

    for (let i = 0; i < commands.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      executeCommand(commands[i]);
    }
    setIsRunning(false);
  };

  const nextLevel = () => {
    setLevel(level + 1);
    showMsg(`🆙 Level ${level + 1} boshlandi!`, "success");
    setShowNextLevel(false);
    setX(1);
    setY(5);
    setDir(1);
    setHasDisk(false);
    setCommands([]);

    const newDiskPos = {
      x: Math.floor(Math.random() * 5) + 1,
      y: Math.floor(Math.random() * 5) + 1,
    };
    let newServerPos = {
      x: Math.floor(Math.random() * 5) + 1,
      y: Math.floor(Math.random() * 5) + 1,
    };

    while (newDiskPos.x === newServerPos.x && newDiskPos.y === newServerPos.y) {
      newServerPos = {
        x: Math.floor(Math.random() * 5) + 1,
        y: Math.floor(Math.random() * 5) + 1,
      };
    }

    setDiskPos(newDiskPos);
    setServerPos(newServerPos);
  };

  const robotRotation = dir * 90;

  return (
    <LinearGradient colors={["#1a1f3a", "#0a0e1a"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.levelInfo}>
            <Text style={styles.levelTitle}>Level {level}</Text>
            <Text style={styles.levelSubtitle}>Robot Dasturlash</Text>
          </View>
        </View>

        <View style={styles.gameArea}>
          <View style={[styles.grid, { width: gridWidth, height: gridWidth }]}>
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
              <View
                key={i}
                style={[styles.cell, { width: cellSize, height: cellSize }]}
              />
            ))}

            {!hasDisk && (
              <View
                style={[
                  styles.disk,
                  {
                    left: diskPos.x * cellSize + cellSize / 2 - 20,
                    top: diskPos.y * cellSize + cellSize / 2 - 5,
                  },
                ]}
              />
            )}

            <View
              style={[
                styles.server,
                {
                  left: serverPos.x * cellSize + cellSize / 2 - 25,
                  top: serverPos.y * cellSize + cellSize / 2 - 25,
                },
              ]}
            >
              <View style={styles.serverLight} />
              <View style={styles.serverLight} />
              <View style={styles.serverLight} />
            </View>

            <View
              style={[
                styles.robot,
                {
                  left: x * cellSize + cellSize / 2 - 25,
                  top: y * cellSize + cellSize / 2 - 25,
                  transform: [{ rotate: `${robotRotation}deg` }],
                },
              ]}
            >
              <View style={styles.robotAntenna} />
              <View style={styles.robotBody}>
                <View style={[styles.robotEye, styles.eyeLeft]} />
                <View style={[styles.robotEye, styles.eyeRight]} />
                {hasDisk && <View style={styles.carryDisk} />}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.codeSection}>
          <Text style={styles.sectionTitle}>Kod</Text>
          <ScrollView style={styles.codeView}>
            {commands.length === 0 ? (
              <Text style={styles.codeEmpty}>
                {"// Buyruqlarni qo'shing 👇"}
              </Text>
            ) : (
              commands.map((cmd, index) => (
                <View key={index} style={styles.codeRow}>
                  <Text style={styles.codeText}>
                    {index + 1}. {cmd}();
                  </Text>
                  <TouchableOpacity onPress={() => deleteCommand(index)}>
                    <Text style={styles.deleteBtn}>⌫</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>
        </View>

        {message ? (
          <View
            style={[
              styles.message,
              messageType === "success" && styles.messageSuccess,
              messageType === "error" && styles.messageError,
            ]}
          >
            <Text style={styles.messageText}>{message}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.controls}>
        <View style={styles.directionGrid}>
          <View style={styles.directionRow}>
            <View style={styles.emptyCell} />
            <TouchableOpacity
              style={styles.dirBtn}
              onPress={() => addCommand("move_forward")}
            >
              <ChevronUp color="#00d4ff" size={28} />
            </TouchableOpacity>
            <View style={styles.emptyCell} />
          </View>
          <View style={styles.directionRow}>
            <TouchableOpacity
              style={styles.dirBtn}
              onPress={() => addCommand("turn_left")}
            >
              <ChevronLeft color="#00d4ff" size={28} />
            </TouchableOpacity>
            <View style={styles.emptyCell} />
            <TouchableOpacity
              style={styles.dirBtn}
              onPress={() => addCommand("turn_right")}
            >
              <ChevronRight color="#00d4ff" size={28} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => addCommand("pick_up")}
          >
            <Text style={styles.actionBtnText}>OL</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => addCommand("insert")}
          >
            <Text style={styles.actionBtnText}>JOY</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.controlButtons}>
          <TouchableOpacity
            style={[styles.controlBtn, styles.runBtn]}
            onPress={run}
          >
            <Play color="#fff" size={20} />
            <Text style={styles.controlBtnText}>ISHGA TUSh</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlBtn, styles.resetBtn]}
            onPress={reset}
          >
            <RotateCcw color="#fff" size={20} />
            <Text style={styles.controlBtnText}>QAYTA</Text>
          </TouchableOpacity>
        </View>

        {showNextLevel && (
          <TouchableOpacity style={styles.nextBtn} onPress={nextLevel}>
            <Text style={styles.nextBtnText}>KEYINGI LEVEL ➡️</Text>
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 340,
  },
  header: {
    marginBottom: 20,
  },
  levelInfo: {
    backgroundColor: "rgba(20, 25, 45, 0.9)",
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#00d4ff",
  },
  levelTitle: {
    fontSize: 24,
    color: "#00d4ff",
    fontWeight: "bold",
  },
  levelSubtitle: {
    fontSize: 14,
    color: "#a0a0a0",
    marginTop: 5,
  },
  gameArea: {
    alignItems: "center",
    marginBottom: 20,
  },
  grid: {
    backgroundColor: "#1a1f35",
    borderRadius: 8,
    borderWidth: 3,
    borderColor: "#00d4ff",
    flexDirection: "row",
    flexWrap: "wrap",
    position: "relative",
  },
  cell: {
    backgroundColor: "#141829",
    margin: 1,
    borderRadius: 2,
  },
  robot: {
    position: "absolute",
    width: 50,
    height: 50,
  },
  robotAntenna: {
    width: 3,
    height: 10,
    backgroundColor: "#00ffff",
    position: "absolute",
    top: 0,
    left: 23,
    borderRadius: 2,
  },
  robotBody: {
    width: 50,
    height: 35,
    backgroundColor: "#3ac1ff",
    borderRadius: 10,
    position: "absolute",
    top: 10,
  },
  robotEye: {
    width: 8,
    height: 8,
    backgroundColor: "#00ffff",
    borderRadius: 4,
    position: "absolute",
    top: 10,
  },
  eyeLeft: {
    left: 12,
  },
  eyeRight: {
    right: 12,
  },
  carryDisk: {
    width: 18,
    height: 8,
    backgroundColor: "#00ff9d",
    position: "absolute",
    bottom: 5,
    left: 16,
    borderRadius: 3,
  },
  disk: {
    position: "absolute",
    width: 40,
    height: 10,
    backgroundColor: "#00ff9d",
    borderRadius: 4,
  },
  server: {
    position: "absolute",
    width: 50,
    height: 50,
    backgroundColor: "#2a3f6d",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#00aaff",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  serverLight: {
    width: 6,
    height: 6,
    backgroundColor: "#00ff9d",
    borderRadius: 3,
  },
  codeSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: "#00d4ff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  codeView: {
    backgroundColor: "#0e1220",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#30343f",
    padding: 15,
    maxHeight: 150,
  },
  codeEmpty: {
    color: "#666",
    fontFamily: "monospace",
  },
  codeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  codeText: {
    color: "#00ff9d",
    fontFamily: "monospace",
    fontSize: 14,
  },
  deleteBtn: {
    color: "#ff4d4d",
    fontSize: 18,
  },
  message: {
    backgroundColor: "rgba(0, 255, 157, 0.1)",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "transparent",
    padding: 15,
    alignItems: "center",
  },
  messageSuccess: {
    borderColor: "#00ff9d",
  },
  messageError: {
    backgroundColor: "rgba(255, 68, 68, 0.1)",
    borderColor: "#ff4444",
  },
  messageText: {
    color: "#00ff9d",
    fontSize: 16,
    fontWeight: "bold",
  },
  controls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#141829",
    borderTopWidth: 3,
    borderTopColor: "#00d4ff",
    padding: 15,
    paddingBottom: 30,
  },
  directionGrid: {
    alignItems: "center",
    marginBottom: 15,
  },
  directionRow: {
    flexDirection: "row",
    gap: 10,
  },
  emptyCell: {
    width: 60,
    height: 60,
  },
  dirBtn: {
    width: 60,
    height: 60,
    backgroundColor: "#1e2540",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#00d4ff",
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 15,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: "#1e2540",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#00d4ff",
    paddingVertical: 15,
    alignItems: "center",
  },
  actionBtnText: {
    color: "#00d4ff",
    fontSize: 16,
    fontWeight: "bold",
  },
  controlButtons: {
    flexDirection: "row",
    gap: 10,
  },
  controlBtn: {
    flex: 1,
    flexDirection: "row",
    gap: 5,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  runBtn: {
    backgroundColor: "#00aa55",
  },
  resetBtn: {
    backgroundColor: "#aa5500",
  },
  controlBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  nextBtn: {
    backgroundColor: "#0088ff",
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 10,
  },
  nextBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
