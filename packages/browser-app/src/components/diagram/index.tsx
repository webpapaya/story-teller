import React from 'react';
import { reactionsToTree } from './reactions-to-tree';
import styles from './index.module.css';

export type Reaction = { useCaseFrom: string, event: string, useCaseTo?: string }
export type ReactionNode<T> = {
  useCaseFrom: T;
  event: string,
  sideEffects: ReactionNode<T>[];
}

const ReactionNode = (props: { reactions: ReactionNode<string>[] }) => {
  if (!props.reactions.length) { return null }
  return (
    <ul className={styles.tree}>
      { props.reactions.map((reaction) => {
        return (
          <li className={styles.node}>
            <span className={styles.description}>{reaction.useCaseFrom}</span>
            <ReactionNode reactions={reaction.sideEffects} />
          </li>
        )
      })}
    </ul>
  )
}

const Badge = (props: { reactions: Reaction[] }) => {
  const reactionTree = reactionsToTree(props.reactions)

  return (
    <ReactionNode reactions={reactionTree} />
  )
}

export default Badge;