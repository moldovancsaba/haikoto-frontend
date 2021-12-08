import React from "react";
import Image from "next/image";
import { useKeyPressEvent } from "react-use";

import { gameService } from "../../services";
import { useMergeState, ArrayMethods, EloRatingAlgorithm } from "../../utils";
import { LoadingImagePlacepholder } from "../../assets";

function VoteCard({ gameId, rightSwipedCards, setPlayState }) {
    const [voteCardState, setVoteCardState] = useMergeState({
        tempRightSwipedCards: rightSwipedCards.slice(1),
        newRightSwipedCard: rightSwipedCards[0],
        voteRandomIndex: ArrayMethods.getRandomIndex(rightSwipedCards.slice(1))
    });

    const { tempRightSwipedCards, newRightSwipedCard, voteRandomIndex } = voteCardState;

    const handleCardClick = async (cardId) => {
        // If picked cardID is newRightSwipedCard, set tempRightSwipedCards to upper half of voteRandomIndex in rightSwipedCards
        let functionTempRightSwipedCards;
        if (cardId === newRightSwipedCard._id) {
            functionTempRightSwipedCards = tempRightSwipedCards.slice(0, voteRandomIndex);
        } else {
            functionTempRightSwipedCards = tempRightSwipedCards.slice(voteRandomIndex + 1);
        }

        // Set the new Card in appropriate order, if leftSwiped card is available in lower/higher of tempRightSwipedCards
        if (functionTempRightSwipedCards.length <= 0) {
            terminateVote(cardId);
            return;
        }

        setVoteCardState({
            tempRightSwipedCards: functionTempRightSwipedCards,
            voteRandomIndex: ArrayMethods.getRandomIndex(functionTempRightSwipedCards)
        });
    };

    const terminateVote = async (cardId) => {
        // const newRightSwipedCardIndexInRightSwipedCards = rightSwipedCards.findIndex(card => card._id === newRightSwipedCard._id);
        const voteRandomIndexCardInRightSwipedCards = rightSwipedCards
            .slice(1)
            .findIndex(
                (card) => card._id === tempRightSwipedCards[voteRandomIndex]._id
            );

        let newlyGeneratedRightSwipedCards;

        if (cardId === newRightSwipedCard._id) {
            // Insert newRightSwipedCard before the index of voteRandomIndex
            newlyGeneratedRightSwipedCards = ArrayMethods.insertItem(
                rightSwipedCards.slice(1),
                voteRandomIndexCardInRightSwipedCards,
                newRightSwipedCard
            );
        } else {
            // Insert newRightSwipedCard after the index of voteRandomIndex
            newlyGeneratedRightSwipedCards = ArrayMethods.insertItem(
                rightSwipedCards.slice(1),
                voteRandomIndexCardInRightSwipedCards + 1,
                newRightSwipedCard
            );
        }

        await gameService.updateRightSwipedCards(gameId, {
            cardIds: newlyGeneratedRightSwipedCards.map((card) => card._id),
            eloScores: newlyGeneratedRightSwipedCards.map((card) => card.eloRating)
        });

        setPlayState({ rightSwipedCards: newlyGeneratedRightSwipedCards, voteMode: false });
    };

    useKeyPressEvent("ArrowRight", () => {
        handleCardClick(tempRightSwipedCards[voteRandomIndex]._id);
    });

    useKeyPressEvent("ArrowLeft", () => {
        handleCardClick(newRightSwipedCard._id);
    });

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-8">
                <div
                    className="cursor-pointer"
                    onClick={() => handleCardClick(newRightSwipedCard._id)}
                >
                    <div className="h-52 w-52 md:h-[30vw] md:w-[30vw] relative mx-auto">
                        <Image
                            src={newRightSwipedCard.image}
                            layout="fill"
                            objectFit="cover"
                            placeholder="blur"
                            blurDataURL={LoadingImagePlacepholder}
                        />
                    </div>
                    <h1 className="font-bold max-w-xs text-[4vh] mx-auto text-center mt-3">
                        {newRightSwipedCard.title}
                    </h1>
                    <p className="text-center text-[4vh]">
                        {newRightSwipedCard.hashtags.map((hashtag) => (
                            <span
                                key={hashtag._id}
                                className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 my-2"
                            >
                                #{hashtag.title}
                            </span>
                        ))}
                    </p>
                </div>
                <div
                    className="cursor-pointer"
                    onClick={() =>
                        handleCardClick(tempRightSwipedCards[voteRandomIndex]._id)
                    }
                >
                    <div className="h-52 w-52 md:h-[30vw] md:w-[30vw] relative mx-auto">
                        <Image
                            src={tempRightSwipedCards[voteRandomIndex].image}
                            layout="fill"
                            objectFit="cover"
                            placeholder="blur"
                            blurDataURL={LoadingImagePlacepholder}
                        />
                    </div>
                    <h1 className="font-bold max-w-xs text-[4vh] mx-auto text-center mt-3">
                        {tempRightSwipedCards[voteRandomIndex].title}
                        <p className="text-center text-[4vh]">
                            {tempRightSwipedCards[voteRandomIndex].hashtags.map(
                                (hashtag) => (
                                    <span
                                        key={hashtag._id}
                                        className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 my-2"
                                    >
                                        #{hashtag.title}
                                    </span>
                                )
                            )}
                        </p>
                    </h1>
                </div>
            </div>
        </>
    );
}

export default VoteCard;
