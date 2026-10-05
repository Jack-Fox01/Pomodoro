import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Card } from '../components/Card';
import { TodoRow } from '../components/TodoRow';
import { useAppData } from '../state/AppDataContext';
import { useAppTheme } from '../theme/ThemeContext';

export function NotesScreen() {
  const { colors, retro } = useAppTheme();
  const { todos, addTodo, removeTodo, reorderTodos, notes, setNotes } = useAppData();

  const [draft, setDraft] = useState('');

  function submit() {
    const text = draft.trim();
    if (text.length === 0) return;
    addTodo(text);
    setDraft('');
  }

  function handleReorder(from: number, to: number) {
    const clamped = Math.max(0, Math.min(todos.length - 1, to));
    reorderTodos(from, clamped);
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <Text style={[styles.viewTitle, { color: colors.inkSoft }]}>Notes &amp; to-dos</Text>

      <Card style={styles.card}>
        <Text style={[styles.heading, { color: colors.ink }]}>To-do list</Text>

        <View style={styles.inputRow}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={submit}
            returnKeyType="done"
            placeholder="Add a task…"
            placeholderTextColor={colors.inkSoft}
            maxLength={120}
            style={[
              styles.input,
              {
                color: colors.ink,
                backgroundColor: colors.settingBg,
                borderColor: colors.line,
                borderRadius: retro ? 2 : 12,
              },
            ]}
          />
          <Pressable
            onPress={submit}
            style={[
              styles.addButton,
              { backgroundColor: colors.focus, borderRadius: retro ? 2 : 12 },
            ]}
          >
            <Text style={styles.addLabel}>Add</Text>
          </Pressable>
        </View>

        {todos.length === 0 ? (
          <Text style={[styles.empty, { color: colors.inkSoft }]}>
            Nothing to do yet. Add a task above.
          </Text>
        ) : (
          <View style={styles.list}>
            {todos.map((todo, index) => (
              <TodoRow
                key={todo.id}
                todo={todo}
                index={index}
                onVanish={removeTodo}
                onRemove={removeTodo}
                onReorder={handleReorder}
              />
            ))}
          </View>
        )}
      </Card>

      <Card style={[styles.card, styles.secondCard]}>
        <Text style={[styles.heading, { color: colors.ink }]}>General notes</Text>

        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Write anything… ideas, reminders, how the day went."
          placeholderTextColor={colors.inkSoft}
          multiline
          style={[
            styles.notesInput,
            {
              color: colors.ink,
              backgroundColor: colors.settingBg,
              borderColor: colors.line,
              borderRadius: retro ? 2 : 12,
            },
          ]}
        />

        <Text style={[styles.saved, { color: colors.inkSoft }]}>Saved</Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 120,
  },
  viewTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 16,
  },
  card: {
    alignItems: 'stretch',
  },
  secondCard: {
    marginTop: 14,
  },
  heading: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderWidth: 1,
    fontSize: 14,
  },
  addButton: {
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  empty: {
    fontSize: 13,
    paddingVertical: 4,
  },
  list: {
    marginTop: 2,
  },
  notesInput: {
    minHeight: 130,
    padding: 12,
    borderWidth: 1,
    fontSize: 14,
    lineHeight: 20,
    textAlignVertical: 'top',
  },
  saved: {
    marginTop: 8,
    fontSize: 12,
    textAlign: 'right',
  },
});
