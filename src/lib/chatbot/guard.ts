import { MAX_INPUT_CHARS } from './config'

// Input hygiene and prompt-injection filtering for visitor messages.
//
// The filter is one layer of several: the system prompt also tells the model to treat visitor text and the
// knowledge as data, the model sees only server-side history (a visitor cannot forge "assistant" messages) and the
// only tool it has can do nothing but save a lead. A flagged message is not sent to the model at all.

/** Removes control and zero-width characters, collapses whitespace and cuts to the input limit. */
export function sanitizeInput(value: string): string {
  return value
    .normalize('NFKC')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁠﻿]/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, MAX_INPUT_CHARS)
}

const PATTERNS: [RegExp, string][] = [
  [/\b(ignore|disregard|forget|override|bypass)\b.{0,40}\b(previous|prior|above|earlier|all|any|the|your|these|those)\b.{0,30}\b(instructions?|prompts?|rules?|guidelines?|directions?|polic(y|ies))\b/i, 'override instructions'],
  [/\b(reveal|show|print|repeat|output|display|leak|tell me|give me|what('?s| is| are))\b.{0,40}\b(system|initial|hidden|original|secret|internal|developer)\b.{0,15}\b(prompts?|instructions?|messages?|rules)\b/i, 'prompt extraction'],
  [/\b(pretend|act as if|roleplay)\b.{0,20}\b(you are|you're|to be)\b|\byou are now\b|\bfrom now on,? you\b|\bnew persona\b/i, 'role change'],
  [/\b(jailbreak|do anything now|dan mode|developer mode|god mode|unfiltered mode)\b/i, 'jailbreak'],
  [/<\|?\s*(system|im_start|im_end|assistant|user)\s*\|?>|\[\/?(INST|SYS)\]|^\s*#{1,3}\s*(system|instructions?)\b|^\s*(system|assistant)\s*:/im, 'role markers'],
  [/\b(api[ _-]?key|secret key|access token|password|credentials?|env(ironment)? variables?)\b.{0,30}\b(show|reveal|give|print|tell|leak|what)\b|\b(show|reveal|give|print|tell|leak|what('?s| is| are))\b.{0,30}\b(api[ _-]?key|secret key|access token|password|credentials?|env(ironment)? variables?)\b/i, 'secret extraction'],
  [/\b(translate|encode|base64|rot13)\b.{0,30}\b(your|the)\b.{0,15}\b(instructions?|prompt)\b/i, 'prompt extraction'],
]

export type InjectionVerdict = { flagged: false } | { flagged: true; reason: string }

export function detectInjection(message: string): InjectionVerdict {
  const text = sanitizeInput(message)
  for (const [pattern, reason] of PATTERNS) if (pattern.test(text)) return { flagged: true, reason }
  return { flagged: false }
}
