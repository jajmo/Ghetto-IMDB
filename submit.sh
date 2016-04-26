#! /bin/sh
################################################################################
# CS 546 Final Project submit.sh
# 04/26/2016
# "I pledge my honor that I have abided by the Stevens Honor System."
################################################################################

ASSIGNMENT='cs546-final-project'

# make tar.gz archive for easy submission
tar -cvzf $ASSIGNMENT.tar.gz ./* --exclude='./node_modules' --exclude='*.zip'

# or zip if you prefer
#zip -r $AUTHOR\_$ASSIGNMENT.zip ./* -x './node_modules/*' '*.tar.gz'

