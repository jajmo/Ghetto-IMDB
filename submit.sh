#! /bin/sh
################################################################################
# CS 546 Final Project submit.sh
# 04/28/2016
# "We pledge our honor that we have abided by the Stevens Honor System."
################################################################################

ASSIGNMENT='cs546-final-project'

# make sure LaTeX is compiled to PDF before submitting
make -C documentation all
make -C documentation clean

# make tar.gz archive for easy submission
tar -cvzf $ASSIGNMENT.tar.gz ./* --exclude='./node_modules' --exclude='*.zip'

# or zip if you prefer
#zip -r $AUTHOR\_$ASSIGNMENT.zip ./* -x './node_modules/*' '*.tar.gz'

