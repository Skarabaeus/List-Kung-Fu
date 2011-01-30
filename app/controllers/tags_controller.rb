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
    @tag.user = current_user

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
    @tag.user = current_user

    if @tag.save
      flash[:notice] = 'Tag has been created.'
    end

    respond_with( @tag )
  end

  def update
    @tag = Tag.find( params[:id] )

    @tag.name = params[ :tag ][ :name ]
    @tag.color_class = params[ :tag ][ :color_class ]
    if @tag.save
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
