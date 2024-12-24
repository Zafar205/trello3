"use client"
import { createContext, useContext, useState } from 'react';
import { Pencil } from 'lucide-react'; // Using lucide-react for the pen icon
import "./globals.css";

interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

interface Task {
  text: string;
  id: string;
  subtasks: Subtask[];
}

interface CardObject {
  index: number;
  title: string;
  description: string;
  tasks: Task[];
}

interface CardContextType {
  cards: CardObject[];
  addCard: () => void;
  deleteCard: (index: number) => void;
  addTask: (cardIndex: number, taskText: string) => void;
  updateTitle: (index: number, title: string) => void;
  updateTask: (cardIndex: number, taskId: string, newText: string, subtasks: Subtask[]) => void;
}

const CardContext = createContext<CardContextType | undefined>(undefined);


function Card({ title, index, tasks }: { title: string; index: number; tasks: Task[] }) {
  const context = useContext(CardContext);
  const [showOptions, setShowOptions] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleText, setTitleText] = useState(title);

  const handleAddTask = () => {
    if (newTaskText.trim() && context) {
      context.addTask(index, newTaskText);
      setNewTaskText("");
    }
  };

  const handleTitleSubmit = () => {
    if (titleText.trim() && context) {
      context.updateTitle(index, titleText);
      setIsEditingTitle(false);
    }
  };

  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    }
  };

  const handleUpdateTask = (taskId: string, newText: string) => {
    if (context) {
      const task = tasks.find(task => task.id === taskId);
      context.updateTask(index, taskId, newText, task ? task.subtasks : []);
    }
  };


  return (
    <div>
      <div className="bg-gray-200 h-auto min-h-[250px] w-[220px] mt-[50px] ml-[20px] rounded-2xl p-4">
        <div className="flex justify-between">
          {isEditingTitle ? (
            <input
              type="text"
              value={titleText}
              onChange={(e) => setTitleText(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyPress={handleTitleKeyPress}
              className="pl-[29px] bg-white rounded-lg text-sm w-32"
              autoFocus
            />
          ) : (
            <h3
              className="pl-[29px] cursor-pointer hover:text-blue-600"
              onClick={() => setIsEditingTitle(true)}
            >
              {title}
            </h3>
          )}

          <div className="relative">
            <img src="./dots.png" alt="not" height="10" width="25" onClick={() => setShowOptions(!showOptions)} />
            {showOptions && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-300 rounded-md shadow-lg">
                <button
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 ml-[40px]"
                  onClick={() => {
                    context?.deleteCard(index);
                    setShowOptions(false);
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="mt-4">
          <ul className="space-y-2">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                cardIndex={index}
                onUpdate={(newText) => handleUpdateTask(task.id, newText)}
              />
            ))}
          </ul>
          <div className="flex gap-2 mb-4 mt-2">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              className="flex-1 px-2 py-1 rounded-lg text-sm w-full"
              placeholder="New task..."
            />
            <button
              onClick={handleAddTask}
              className="bg-blue-500 text-white px-2 py-1 text-sm rounded-xl"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [cards, setCards] = useState<Array<CardObject>>([]);
  const [showTitleInput, setShowTitleInput] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [globalTaskText, setGlobalTaskText] = useState("");
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);

  const addCard = () => {
    if (!showTitleInput) {
      setShowTitleInput(true);
      return;
    }

    if (newCardTitle.trim()) {
      const newCard: CardObject = {
        title: newCardTitle,
        description: "This is a new card",
        index: cards.length,
        tasks: []
      };
      setCards([...cards, newCard]);
      setNewCardTitle("");
      setShowTitleInput(false);
    }
  };

  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addCard();
    }
  };

  const deleteCard = (index: number) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  const addTask = (cardIndex: number, taskText: string) => {
    setCards(cards.map((card, i) => {
      if (i === cardIndex) {
        return {
          ...card,
          tasks: [...card.tasks, { text: taskText, id: Date.now().toString(), subtasks: [] }]
        };
      }
      return card;
    }));
  };


  const updateTask = (cardIndex: number, taskId: string, newText: string, subtasks: Subtask[]) => {
    setCards(cards.map((card, i) => {
      if (i === cardIndex) {
        return {
          ...card,
          tasks: card.tasks.map(task =>
            task.id === taskId ? { ...task, text: newText, subtasks } : task
          )
        };
      }
      return card;
    }));
  };
  const handleGlobalAddTask = () => {
    if (selectedCardIndex !== null && globalTaskText.trim()) {
      addTask(selectedCardIndex, globalTaskText);
      setGlobalTaskText("");
    }
  };

  const updateTitle = (index: number, title: string) => {
    setCards(cards.map((card, i) => {
      if (i === index) {
        return {
          ...card,
          title
        };
      }
      return card;
    }));
  };

  const contextValue = {
    cards,
    addCard,
    deleteCard,
    addTask,
    updateTitle,
    updateTask
  };

  return (
    <CardContext.Provider value={contextValue}>
      <div className="flex flex-row m-[20px]">
        <input
          type="text"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-2xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          placeholder="Write task details"
          value={globalTaskText}
          onChange={(e) => setGlobalTaskText(e.target.value)}
        />
        <button
          type="button"
          className="text-white ml-2 mt-1 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-2xl text-sm px-5 py-2.5 me-2 mb-2"
          onClick={handleGlobalAddTask}
        >
          Add
        </button>
        <select
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-2xl focus:ring-blue-500 focus:border-blue-500 block w-[300px] p-2.5 ml-2"
          onChange={(e) => setSelectedCardIndex(e.target.value ? parseInt(e.target.value) : null)}
          value={selectedCardIndex !== null ? selectedCardIndex : ""}
        >
          <option value="">Select Card</option>
          {cards.map((card, index) => (
            <option key={index} value={index}>{card.title}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-row flex-wrap">
        {cards.map((card, index) => (
          <div key={index} className="flex-shrink-0">
            <Card
              title={card.title}
              index={index}
              tasks={card.tasks}
            />
          </div>
        ))}
        <div className="flex-shrink-0">
          {showTitleInput ? (
            <div className="bg-gray-200 h-[60px] w-[220px] mt-[150px] ml-[100px] rounded-3xl p-4 flex items-center">
              <input
                type="text"
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                onKeyPress={handleTitleKeyPress}
                className="w-full px-3 py-2 rounded-xl text-sm"
                placeholder="Enter card title..."
                autoFocus
              />
            </div>
          ) : (
            <button
              className="bg-slate-500 w-[150px] h-[50px] mt-[150px] ml-[100px] rounded-3xl text-white"
              onClick={addCard}
            >
              + Add Card
            </button>
          )}
        </div>
      </div>
    </CardContext.Provider>
  );
}


// New Modal Component for Tasks
function TaskModal({
  isOpen,
  onClose,
  task,
  cardIndex,
  onUpdateTask
}: {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  cardIndex: number;
  onUpdateTask: (taskId: string, newText: string, subtasks: Subtask[]) => void;
}) {
  const [newSubtaskText, setNewSubtaskText] = useState("");
  const [subtasks, setSubtasks] = useState<Subtask[]>(task.subtasks || []);
  const [taskText, setTaskText] = useState(task.text);

  const handleAddSubtask = () => {
    if (newSubtaskText.trim()) {
      const newSubtask: Subtask = {
        id: Date.now().toString(),
        text: newSubtaskText,
        completed: false,
      };
      setSubtasks([...subtasks, newSubtask]);
      setNewSubtaskText("");
    }
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    setSubtasks(subtasks.filter(st => st.id !== subtaskId));
  };

  const toggleSubtask = (subtaskId: string) => {
    setSubtasks(
      subtasks.map(st =>
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      )
    );
  };

  const handleSave = () => {
    onUpdateTask(task.id, taskText, subtasks);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-[500px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            className="text-xl font-bold px-2 py-1 rounded border-2 border-transparent focus:border-blue-500 outline-none"
          />
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <h3 className="text-lg font-semibold mb-2">Subtasks</h3>
        <ul>
          {subtasks.map(subtask => (
            <li key={subtask.id} className="flex items-center">
              <input
                type="checkbox"
                checked={subtask.completed}
                onChange={() => toggleSubtask(subtask.id)}
              />
              <span className="ml-2">{subtask.text}</span>
              <button
                onClick={() => handleDeleteSubtask(subtask.id)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2 mt-4">
          <input
            type="text"
            value={newSubtaskText}
            onChange={(e) => setNewSubtaskText(e.target.value)}
            className="flex-1 px-2 py-1 rounded-lg text-sm"
            placeholder="New subtask..."
          />
          <button
            onClick={handleAddSubtask}
            className="bg-blue-500 text-white px-2 py-1 rounded-lg"
          >
            Add Subtask
          </button>
        </div>
        <button
          onClick={handleSave}
          className="bg-green-500 text-white px-4 py-2 rounded-lg mt-4"
        >
          Save
        </button>
      </div>
    </div>
  );
}


// Modified TaskItem component
function TaskItem({ task, cardIndex, onUpdate }: { task: Task; cardIndex: number; onUpdate: (text: string, subtasks: Subtask[]) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = () => {
    if (editText.trim()) {
      onUpdate(editText, task.subtasks || []);
      setIsEditing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <>
      <li className="bg-white p-2 rounded-lg text-sm flex justify-between items-center group cursor-pointer">
        <div onClick={() => setIsModalOpen(true)} className="flex-1">
          {isEditing ? (
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleSubmit}
              onKeyPress={handleKeyPress}
              className="flex-1 px-2 py-1 rounded-lg text-sm"
              autoFocus
            />
          ) : (
            <span>{task.text}</span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Pencil size={14} className="text-gray-500 hover:text-blue-500" />
        </button>
      </li>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={task}
        cardIndex={cardIndex}
        onUpdateTask={(taskId, newText, subtasks) => onUpdate(newText, subtasks)}
      />
    </>
  );
}