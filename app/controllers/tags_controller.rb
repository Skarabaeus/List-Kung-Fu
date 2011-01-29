class TagsController < ApplicationController

	before_filter :authenticate_user!

  respond_to :xml
  
  def index
    @tags = Tag.order( "name asc" )
    respond_with(@tags)
  end

  def show
    @tag = Tag.find( params[:id] )
    respond_with(@tag)
  end

  def new
    @tag = Tag.new

    respond_with( @tag ) do |format|
      format.js
    end
  end

  def edit
    @tag = Tag.find( params[:id] )

    respond_with( @tag ) do |format|
      format.js
    end
  end

  def create
    @tag = Tag.new(params[:tag])

    if @tag.save
      flash[:notice] = 'Tag has been created.'
    end
    
    respond_with( @tag )
  end

  def update
    @tag = Tag.find( params[:id] )
    if @tag.update_attributes(params[:tag])
      flash[:notice] = 'Tag has been updated.'
    end
    
    respond_with( @tag )
  end

  def destroy
    @tag = Tag.find( params[:id] )
    @tag.destroy
    
    respond_with( @tag )
  end


end
