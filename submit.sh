#! /bin/sh
################################################################################
# CS 546 Final Project submit.sh
# 05/06/2016
# "We pledge our honor that we have abided by the Stevens Honor System."
################################################################################

ASSIGNMENT='cs546-final-project'

# make sure LaTeX is compiled to PDF before submitting
make -C documentation all
make -C documentation clean

# include a database dump
mongodump --db ghetto_imdb

# make tar.gz archive for easy submission
#tar -cvzf $ASSIGNMENT.tar.gz ./* --exclude='./node_modules' --exclude='*.zip'

# or zip if you prefer
zip -r $ASSIGNMENT.zip ./* -x './node_modules/*' '*.tar.gz'

