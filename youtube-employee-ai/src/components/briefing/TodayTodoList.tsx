'use client';

import { useState } from 'react';

export function TodayTodoList({ todos }: { todos: string[] }) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const toggle = (index: number) => {
    setChecked((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <section className="rounded-lg border border-neutral-200 p-6 dark:border-neutral-800">
      <h2 className="mb-3 text-base font-semibold">今日やるべきこと</h2>
      {todos.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">タスクがありません。</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {todos.map((todo, index) => (
            <li key={index}>
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(checked[index])}
                  onChange={() => toggle(index)}
                  className="mt-1"
                />
                <span className={checked[index] ? 'text-neutral-400 line-through' : ''}>
                  {todo}
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
