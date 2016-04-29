PROPOSAL=proposal.tex
DBPROPOSAL=database_proposal.tex
PDF=$(PROPOSAL:.tex=.pdf) $(DBPROPOSAL:.tex=.pdf)
PDFTEX=pdflatex
RM=rm -f

all:
	$(PDFTEX) $(PROPOSAL)
	$(PDFTEX) $(DBPROPOSAL)

clean:
	$(RM) *.aux
	$(RM) *.log

fclean: clean
	$(RM) $(PDF)

re: fclean all
